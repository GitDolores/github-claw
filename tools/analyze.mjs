#!/usr/bin/env node
// Repo analyzer: clones a GitHub repo (depth 1), scans source files,
// and produces a plain-language analysis report as JSON.
//
// Usage:
//   node tools/analyze.mjs <owner/repo> [--force] [--dry-run] [--out dir]
//
// Progress reporting: writes tools/analysis-status.json at each stage
// (also callable as library: export async function analyzeRepo(...)).

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { LANGUAGES, FRAMEWORKS, FILE_SIGNALS, ENTRY_HINTS, PATTERN_SIGNALS } from './dictionaries.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(ROOT, 'site', 'data', 'reports');
const STATUS_FILE = path.join(ROOT, 'site', 'data', 'analysis-status.json');

// ---------- CLI ----------
const args = process.argv.slice(2);
const targets = args.filter(a => !a.startsWith('--'));
const force = args.includes('--force');
const dryRun = args.includes('--dry-run');

const MAX_FILES = 3000;          // hard cap of files to read
const MAX_FILE_BYTES = 300 * 1024; // skip files larger than 300KB
const MAX_LINE_SAMPLES = 40;     // code samples kept per repo
const CLONE_TIMEOUT_MS = 8 * 60 * 1000;
const PROGRESS_GRANULARITY = 30; // report progress every N files

// ---------- helpers ----------
function now() { return new Date().toISOString(); }

function writeStatus(status) {
  const payload = { ...status, updated_at: now() };
  fs.mkdirSync(path.dirname(STATUS_FILE), { recursive: true });
  fs.writeFileSync(STATUS_FILE, JSON.stringify(payload, null, 2));
}

function slug(repo) { return repo.replace('/', '__'); }

function httpGetJson(url, token) {
  // kept for API parity; curlJson is the sync workhorse
  throw new Error('use curlJson');
}

// Sync JSON GET via curl (avoids ESM top-level await complexity in loop)
function curlJson(url, token) {
  const args = ['-s', '--max-time', '30', url];
  if (token) {
    args.unshift('-H', `Authorization: Bearer ${token}`);
  }
  const out = execFileSync('curl', args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 }).trim();
  if (!out) throw new Error(`empty response from ${url}`);
  const json = JSON.parse(out);
  if (json.message) throw new Error(`GitHub API error: ${json.message}`);
  return json;
}

function humanizeBytes(n) {
  if (n > 1024 * 1024 * 1024) return (n / 1024 / 1024 / 1024).toFixed(1) + ' GB';
  if (n > 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + ' MB';
  if (n > 1024) return (n / 1024).toFixed(1) + ' KB';
  return n + ' B';
}

function humanizeNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

// ---------- cloning ----------
function tryClone(repo, workDir) {
  const url = `https://github.com/${repo}.git`;
  try {
    execFileSync('git', ['clone', '--depth', '1', '--single-branch', url, workDir], {
      stdio: 'pipe',
      timeout: CLONE_TIMEOUT_MS,
    });
    return true;
  } catch (e) {
    return false;
  }
}

// ---------- repo metadata ----------
function fetchMeta(repo, token) {
  const meta = curlJson(`https://api.github.com/repos/${repo}`, token);
  return {
    full_name: meta.full_name,
    description: meta.description || '',
    stars: meta.stargazers_count,
    forks: meta.forks_count,
    open_issues: meta.open_issues_count,
    language: meta.language,
    topics: meta.topics || [],
    license: meta.license ? meta.license.spdx_id : null,
    default_branch: meta.default_branch,
    pushed_at: meta.pushed_at,
    created_at: meta.created_at,
    homepage: meta.homepage || null,
    size_kb: meta.size,
    archived: meta.archived,
  };
}

// ---------- scanning ----------
const CODE_EXT = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.py', '.go', '.rs', '.java', '.rb', '.php', '.c', '.h', '.cpp', '.hpp', '.cc', '.cs', '.swift', '.kt', '.sh', '.vue', '.svelte', '.scala', '.r', '.jl', '.lua', '.pl']);
const SKIP_DIRS = new Set(['.git', 'node_modules', 'vendor', 'dist', 'build', 'out', 'target', '__pycache__', '.venv', 'venv', '.idea', '.vscode', 'coverage', '.next', '.nuxt', 'site-packages', 'third_party', 'thirdparty']);
const DOC_FILES = new Set(['readme.md', 'contributing.md', 'changelog.md', 'license', 'code_of_conduct.md', 'security.md', 'docs', 'examples', 'tests', 'test', 'benchmarks']);

function walkFiles(root) {
  const files = [];
  let totalBytes = 0;
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (SKIP_DIRS.has(e.name)) continue;
        stack.push(full);
      } else if (e.isFile()) {
        let st; try { st = fs.statSync(full); } catch { continue; }
        totalBytes += st.size;
        files.push({ full, rel: path.relative(root, full).replace(/\\/g, '/'), size: st.size });
      }
    }
  }
  return { files, totalBytes };
}

function detectLanguages(files) {
  const byLang = {};
  const byLangBytes = {};
  for (const f of files) {
    const ext = path.extname(f.rel).toLowerCase().slice(1);
    if (!LANGUAGES[ext]) continue;
    byLang[ext] = (byLang[ext] || 0) + 1;
    byLangBytes[ext] = (byLangBytes[ext] || 0) + f.size;
  }
  // rank by total bytes (matches GitHub's language bar better than file count)
  return Object.entries(byLangBytes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([ext]) => ({ ...LANGUAGES[ext], ext, files: byLang[ext] }));
}

function detectFrameworks(files) {
  const found = [];
  const seen = new Set();
  for (const f of files) {
    const base = path.basename(f.rel).toLowerCase();
    for (const [manifest, rules] of Object.entries(FRAMEWORKS)) {
      let ruleList = rules;
      if (typeof rules === 'string') ruleList = FRAMEWORKS[rules];
      if (manifest !== base) continue;
      // read manifest and look for deps
      try {
        const content = fs.readFileSync(f.full, 'utf8');
        for (const rule of ruleList) {
          const depName = rule.dep.replace(/-/g, '[-_]');
          const re = new RegExp(`["'/]${depName}["'/@]|^\s*${depName}\s*[=<>~]`, 'im');
          if (re.test(content) && !seen.has(rule.label)) {
            seen.add(rule.label);
            found.push(rule);
          }
        }
      } catch { /* unreadable */ }
    }
  }
  // file-name signals
  for (const f of files) {
    const base = path.basename(f.rel).toLowerCase();
    const dir0 = f.rel.split('/')[0].toLowerCase();
    if (FILE_SIGNALS[base]) {
      const s = FILE_SIGNALS[base];
      if (!seen.has(s.label)) { seen.add(s.label); found.push(s); }
    }
    if (dir0 === '.github' && !seen.has('GitHub Actions')) {
      const s = FILE_SIGNALS['.github/workflows'];
      seen.add('GitHub Actions'); found.push(s);
    }
  }
  return found.slice(0, 14);
}

function buildDirTree(files, maxDepth = 2) {
  // aggregate by parent directory (real dirs only), capped at maxDepth
  const dirs = {};
  for (const f of files) {
    const parts = f.rel.split('/');
    let top;
    if (parts.length === 1) {
      top = '/';
    } else {
      top = parts.slice(0, Math.min(parts.length - 1, maxDepth)).join('/');
    }
    (dirs[top] ??= { files: [], count: 0 });
    dirs[top].count++;
    if (dirs[top].files.length < 4) dirs[top].files.push(f.rel);
  }
  return Object.entries(dirs)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 12)
    .map(([dir, info]) => ({ dir, count: info.count, sample: info.files }));
}

const DIR_MEANINGS = {
  src: '源代码主目录（src = source）',
  lib: '库代码目录',
  app: '应用代码目录',
  core: '核心逻辑代码',
  components: 'UI 组件目录',
  pages: '页面目录（按路由组织）',
  api: '后端接口目录',
  server: '服务器代码',
  client: '浏览器端代码',
  models: '数据模型 / AI 模型定义',
  utils: '工具函数集散地',
  tools: '开发辅助脚本',
  scripts: '自动化脚本',
  tests: '测试代码',
  test: '测试代码',
  docs: '项目文档',
  examples: '示例代码（学习入口！）',
  assets: '静态资源（图片字体等）',
  static: '静态文件',
  public: '对外公开的静态文件',
  config: '配置文件',
  data: '数据文件',
  site: '网站目录',
  benchmarks: '性能测试',
  workflows: 'CI 流水线定义',
  '.github': 'GitHub 平台专属配置（Actions、Issue 模板等）',
};

function explainDir(dir) {
  const first = dir.split('/')[0];
  return DIR_MEANINGS[first] || null;
}

function findEntryFiles(files) {
  const priorities = ['main.py', 'app.py', 'cli.py', 'index.js', 'index.ts', 'main.go', 'main.rs', 'src/index.js', 'src/index.ts', 'src/main.py', 'src/app.py', 'server.js', 'app.py', 'train.py'];
  const byName = new Map(files.map(f => [f.rel, f]));
  for (const p of priorities) {
    if (byName.has(p)) return [byName.get(p)];
  }
  // fallback: top-level entry-hint files
  const hits = files.filter(f => ENTRY_HINTS[path.basename(f.rel)] && f.rel.split('/').length <= 2).slice(0, 2);
  return hits;
}

function findCoreModules(files, langs) {
  // Heuristic: largest source files + entry files + files with "core/main/model/api/router" in name
  const sourceFiles = files.filter(f => CODE_EXT.has(path.extname(f.rel)));
  const byImportCount = {}; // rough proxy: count occurrences of the module path in others' text is too slow; use size+name heuristics
  const scored = sourceFiles.map(f => {
    let score = Math.min(f.size / 2000, 10); // size-based
    const parts = f.rel.split('/');
    const stem = path.basename(f.rel, path.extname(f.rel)).toLowerCase();
    if (['index', 'main', 'app', 'server', 'router', 'model', 'core', 'cli', 'train'].includes(stem)) score += 8;
    if (['model', 'models', 'core', 'engine', 'pipeline', 'net', 'layers'].includes(parts[parts.length - 2]?.toLowerCase())) score += 6;
    if (parts.length <= 2) score += 3; // top-level files matter more
    return { f, score };
  });
  const top = scored.sort((a, b) => b.score - a.score).slice(0, 8);
  return top.map(({ f }) => ({
    path: f.rel,
    size: humanizeBytes(f.size),
    why: explainModule(f.rel),
  }));
}

function explainModule(rel) {
  const parts = rel.split('/');
  const stem = path.basename(rel, path.extname(rel)).toLowerCase();
  const dir = parts.length > 1 ? parts[parts.length - 2].toLowerCase() : '';
  if (stem === 'index') return '入口/汇总文件：这个目录的对外门面';
  if (stem === 'main' || stem === 'app') return '程序主入口：整个应用从这里启动';
  if (stem === 'cli') return '命令行入口：解析用户输入的命令';
  if (stem === 'router' || stem === 'routes') return '路由：把网址分发给对应处理函数';
  if (stem === 'model' || stem === 'models') return '数据/AI 模型定义';
  if (stem === 'config' || stem === 'settings') return '配置：集中管理可调参数';
  if (stem === 'train' || stem === 'trainer') return '训练逻辑：教 AI 学东西的代码';
  if (stem === 'pipeline') return '流水线：把多个步骤串起来';
  if (dir === 'models') return '数据模型层';
  if (dir === 'core' || dir === 'engine') return '核心引擎模块';
  if (dir === 'utils' || dir === 'helpers') return '工具函数';
  return null;
}

function findPatterns(texts) {
  // texts: array of {rel, content-samples}
  const hits = [];
  const seen = new Set();
  for (const { rel, sample } of texts) {
    for (const p of PATTERN_SIGNALS) {
      if (seen.has(p.pattern)) continue;
      if (p.re.test(sample)) {
        seen.add(p.pattern);
        hits.push({ pattern: p.pattern, speak: p.speak, severity: p.severity, where: rel });
      }
    }
  }
  return hits.slice(0, 10);
}

function extractComments(content, lang) {
  // naive: pull a few comment lines to quote in report
  const lines = content.split('\n');
  const out = [];
  const commentRe = /^\s*(\/\/|#|\*|\/\*)\s?(.{6,160})/;
  for (const l of lines) {
    const m = l.match(commentRe);
    if (m && !m[2].startsWith('!')) out.push(m[2].trim());
    if (out.length >= 3) break;
  }
  return out;
}

function readSample(f) {
  try {
    const content = fs.readFileSync(f.full, 'utf8');
    return content.slice(0, 20000); // cap sample size
  } catch { return ''; }
}

// ---------- the report assembly ----------
function makeOverview(meta, files, totalBytes, langs, frameworks) {
  const primary = langs[0] || { label: meta.language || '未知', speak: '' };
  const nFiles = files.length;
  const sizeStr = humanizeBytes(totalBytes);
  const starStr = humanizeNum(meta.stars ?? 0);
  const lines = [];
  lines.push(`「${meta.full_name}」是一个以 ${primary.label} 为主的项目，仓库里大约有 ${nFiles} 个文件（不含 git 内部文件），源码规模约 ${sizeStr}。`);
  if (meta.description) lines.push(`官方一句话介绍：${meta.description}`);
  if (meta.stars != null) lines.push(`它在 GitHub 上拿到了 ${starStr} 颗星、${humanizeNum(meta.forks ?? 0)} 次复刻（fork），${meta.open_issues != null ? `还有 ${meta.open_issues} 个开放中的 issue` : ''}。`);
  if (meta.topics && meta.topics.length) lines.push(`官方标签：${meta.topics.slice(0, 6).join('、')}。`);
  if (meta.license) lines.push(`许可证是 ${meta.license}，决定了你怎么合法使用这些代码。`);
  lines.push(`主要语言${langs.length > 1 ? '构成（按文件数）：' + langs.map(l => `${l.label} ${l.files} 个文件`).join('、') : '：' + primary.label + (primary.speak ? `（${primary.speak}）` : '')}。`);
  if (frameworks.length) lines.push(`用到的关键框架/工具：${frameworks.slice(0, 6).map(x => x.label).join('、')}。`);
  lines.push(`一句话总结：${oneLineSummary(meta, langs, frameworks)}`);
  return lines.filter(Boolean).join(' ');
}

function oneLineSummary(meta, langs, frameworks) {
  const fw = frameworks.map(f => f.label);
  const aiHints = fw.some(x => /torch|transformers|diffusers|tensorflow|scikit/i.test(x)) || /ai|ml|llm|gpt|neural|deep/i.test((meta.description || '') + ' ' + (meta.topics || []).join(' '));
  const webHints = fw.some(x => /react|vue|next|nuxt|express|fastify/i.test(x));
  if (aiHints) return `这是一个 AI/机器学习项目${primaryLangNote(langs)}，适合想了解「模型是怎么搭起来」的读者。`;
  if (webHints) return `这是一个 Web 应用项目${primaryLangNote(langs)}，适合想看「一个网站如何组织代码」的读者。`;
  return `这是一个以${langs[0]?.label || '通用'}开发的项目，结构和文档都比较规范，适合通读学习。`;
}

function primaryLangNote(langs) {
  return langs[0] ? `（主力语言 ${langs[0].label}）` : '';
}

function makeDataFlow(entry, modules, frameworks, patterns) {
  // Narrate a plausible data flow from entry -> modules
  const steps = [];
  steps.push(`你（用户/调用方）发起一个动作：运行命令、打开网页或调用接口。`);
  if (entry && entry[0]) {
    steps.push(`程序从入口文件「${entry[0].rel}」启动，先做初始化：读配置、准备环境、注册要用的组件。`);
  }
  const routerish = modules.find(m => /router|routes|api|server|controller/i.test(m.path));
  const modelish = modules.find(m => /model|engine|core|net|layers|pipeline|train/i.test(m.path));
  if (routerish) steps.push(`请求进入「${routerish.path}」这类分发层：它判断「你想要什么」，把活儿派给对应的处理单元。`);
  const utilish = modules.find(m => /util|helper|common/i.test(m.path));
  if (modelish) steps.push(`核心逻辑在「${modelish.path}」这类模块里：真正的计算/推理/业务规则都发生在这里。`);
  if (utilish) steps.push(`过程中会借道「${utilish.path}」这类工具模块：它们像瑞士军刀，谁需要谁来拿。`);
  if (frameworks.some(f => /数据库|ORM|Prisma|Sequelize|SQL/i.test(f.label))) steps.push(`需要存取的数据会落到数据库，通过 ORM 层读写。`);
  steps.push(`处理完成后，结果原路返回：渲染成页面、打印到终端或打包成 API 响应，交回给你。`);
  const errHandling = patterns.find(p => p.pattern === '异常捕获');
  if (errHandling) steps.push(`任何一步出错都会被 try/catch 兜住，转成友好的错误提示，而不是直接崩溃。`);
  return steps;
}

function makeReadSuggestion(meta, entry, modules, langs, frameworks) {
  const tips = [];
  frameworks = frameworks || [];
  modules = modules || [];
  langs = langs || [];
  tips.push({ title: '第一步：读 README', body: `打开仓库根目录的 README.md，了解它「是什么、解决什么问题、怎么跑起来」。${meta.homepage ? `它有官网/文档：${meta.homepage}` : ''}` });
  if (frameworks.some(f => /examples/i.test(f.label)) || modules.some(m => /examples?\//i.test(m.path))) {
    tips.push({ title: '第二步：跑一个最小示例', body: 'example 目录是作者留的「能跑的玩具」，先跑通一个再回来读代码，事半功倍。' });
  }
  if (entry && entry[0]) {
    tips.push({ title: '第三步：从入口顺藤摸瓜', body: `从「${entry[0].rel}」开始读，每遇到一个陌生函数就跳过去看一眼，回来继续。像逛公园，先走主路再钻小径。` });
  }
  if (langs[0] && langs[0].ext === 'py') tips.push({ title: '读 Python 代码的窍门', body: '重点看 import 部分和 class/def 定义名，先搞清「有哪几块」，再挑一块细读。' });
  if (langs[0] && ['.js', '.ts', '.jsx', '.tsx'].includes(langs[0].ext)) tips.push({ title: '读前端代码的窍门', body: '先看 package.json 的 dependencies（它用了什么积木），再看路由/页面目录，最后看状态管理。' });
  tips.push({ title: '善用目录语义', body: 'src=源码、tests=测试、docs=文档、examples=示例，目录名本身就是地图。' });
  tips.push({ title: '带着问题读', body: '比如「数据从哪进来」「结果存在哪」「错误怎么处理」，带着三个问题读任何项目都不会迷路。' });
  return tips;
}

// ---------- main per-repo analysis ----------
function analyzeRepo(repo, token, onProgress) {
  const report = { repo };
  const reportPath = path.join(REPORTS_DIR, `${slug(repo)}.json`);
  if (!force && fs.existsSync(reportPath)) {
    return { cached: true, path: reportPath };
  }

  const stage = (name, pct, extra) => {
    const info = { repo, stage: name, progress: pct, ...(extra || {}) };
    writeStatus(info);
    if (onProgress) onProgress(info);
  };

  stage('fetch-meta', 5, { note: '获取仓库基本信息' });
  let meta;
  try {
    meta = fetchMeta(repo, token);
  } catch (e) {
    return { error: `无法获取仓库信息: ${e.message}` };
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claw-'));
  let files = [], totalBytes = 0;
  let cloneOk = false;

  stage('clone', 20, { note: `克隆仓库（浅克隆，只取最新版本）` });
  cloneOk = tryClone(repo, tmpDir);

  if (cloneOk) {
    stage('scan', 45, { note: '扫描文件结构' });
    const walked = walkFiles(tmpDir);
    files = walked.files;
    totalBytes = walked.totalBytes;

    stage('read', 65, { note: `抽样阅读源码（${Math.min(files.length, MAX_FILES)} 个文件中）` });
    const codeFiles = files.filter(f => CODE_EXT.has(path.extname(f.rel)) && f.size < MAX_FILE_BYTES);
    const docs = files.filter(f => /\.(md|rst|txt)$/i.test(f.rel) && f.size < MAX_FILE_BYTES && f.rel.split('/').length <= 2);
    // progress reporting during read
    let readCount = 0;
    const texts = [];
    for (const f of codeFiles.slice(0, MAX_FILES)) {
      const sample = readSample(f);
      if (sample) texts.push({ rel: f.rel, sample });
      readCount++;
      if (readCount % PROGRESS_GRANULARITY === 0) {
        stage('read', 65 + Math.round(25 * readCount / Math.min(codeFiles.length, MAX_FILES)), { note: `已阅读 ${readCount} 个源码文件` });
      }
    }

    stage('analyze', 90, { note: '归纳技术栈与设计模式' });
    const langs = detectLanguages(files);
    const frameworks = detectFrameworks(files);
    const tree = buildDirTree(files);
    const entry = findEntryFiles(files);
    const modules = findCoreModules(files, langs);
    const patterns = findPatterns(texts);

    // pull a few doc quotes
    const docQuotes = [];
    for (const d of docs.slice(0, 3)) {
      try {
        const c = fs.readFileSync(d.full, 'utf8').slice(0, 4000);
        const paras = c.split(/\n\s*\n/).filter(p => p.trim().length > 40 && !p.trim().startsWith('#'));
        if (paras[0]) docQuotes.push({ file: d.rel, text: paras[0].trim().replace(/\r/g, '').replace(/\n+/g, ' ').slice(0, 300) });
      } catch {}
    }

    report.data = {
      meta,
      overview: makeOverview(meta, files, totalBytes, langs, frameworks),
      languages: langs,
      frameworks,
      dir_tree: tree.map(t => ({ ...t, meaning: explainDir(t.dir) })),
      entry_files: entry.map(e => ({ path: e.rel, hint: ENTRY_HINTS[path.basename(e.rel)] || '入口文件' })),
      core_modules: modules,
      data_flow: makeDataFlow(entry, modules, frameworks, patterns),
      patterns,
      doc_quotes: docQuotes,
      read_suggestions: makeReadSuggestion(meta, entry, modules, langs, frameworks),
      stats: { files: files.length, bytes: totalBytes, sampled: texts.length },
      generated_at: now(),
      analyzer: 'claw-static-analyzer v1',
    };
  } else {
    // Fallback: metadata-only profile
    stage('api-fallback', 60, { note: '仓库太大或克隆失败，改用 GitHub API 元数据生成轻量档案' });
    const langData = curlJson(`https://api.github.com/repos/${repo}/languages`, token);
    const langs = Object.entries(langData).slice(0, 5).map(([label, bytes]) => ({ label, speak: LANGUAGES[label.toLowerCase()]?.speak || '', bytes, files: null }));
    report.data = {
      meta,
      overview: `「${meta.full_name}」规模较大（${humanizeBytes((meta.size_kb || 0) * 1024)}），静态克隆分析较慢，这里给出基于 GitHub 元数据的轻量档案。${meta.description ? `官方介绍：${meta.description}` : ''} 它有 ${humanizeNum(meta.stars ?? 0)} 颗星，主要语言是 ${meta.language || '未知'}。建议先读 README，再看 examples 目录。`,
      languages: langs,
      frameworks: [],
      dir_tree: [],
      entry_files: [],
      core_modules: [],
      data_flow: ['（仓库规模大，未做源码级扫描；数据流说明需要克隆分析）'],
      patterns: [],
      doc_quotes: [],
      read_suggestions: makeReadSuggestion(meta, [], [], langs),
      stats: { files: null, bytes: (meta.size_kb || 0) * 1204, sampled: 0 },
      generated_at: now(),
      analyzer: 'claw-metadata-profile v1',
    };
  }

  // cleanup
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}

  if (dryRun) {
    return { ok: true, dryRun: true, data: report.data };
  }

  stage('write', 98, { note: '写报告' });
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report.data, null, 2));

  stage('done', 100, { note: `完成：${repo}` });
  return { ok: true, path: reportPath };
}

// ---------- entry ----------
async function main() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || null;
  let list = targets;
  if (list.length === 0) {
    // analyze all projects in projects.json
    const projectsPath = path.join(ROOT, 'site', 'data', 'projects.json');
    if (fs.existsSync(projectsPath)) {
      const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
      list = projects.map(p => new URL(p.repo_url).pathname.replace(/^\//, '').replace(/\.git$/, ''));
    }
  }
  writeStatus({ repo: null, stage: 'start', progress: 0, note: `开始分析 ${list.length} 个项目` });
  const results = [];
  for (const repo of list) {
    const r = analyzeRepo(repo, token);
    results.push({ repo, ...r });
  }
  writeStatus({ repo: null, stage: 'all-done', progress: 100, note: `全部完成：${results.length} 个项目` });
  for (const r of results) {
    if (r.error) console.error(`✗ ${r.repo}: ${r.error}`);
    else if (r.cached) console.log(`= ${r.repo}: cached, skipped`);
    else if (r.dryRun) console.log(`✓ ${r.repo}: dry-run ok`);
    else console.log(`✓ ${r.repo}: report written to ${r.path}`);
  }
  if (results.some(r => r.error)) process.exit(1);
}

// Run CLI when invoked directly
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  main().catch(e => { console.error(e); process.exit(1); });
}

export { analyzeRepo };
