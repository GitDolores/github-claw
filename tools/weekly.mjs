#!/usr/bin/env node
// Weekly featured-project rotation.
//
// Keeps each project in site/data/projects.json featured for FEATURE_WEEKS,
// then archives it to archive.json (auto-categorized) and pulls replacements
// from backlog.json. Stars/last_updated are refreshed via the GitHub API.
//
// Usage:
//   node tools/weekly.mjs [--weeks N] [--dry-run]
//   node tools/weekly.mjs --simulate-old   # treat featured_since as 5 weeks ago (demo)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { classifyProject, enrichProject, CATEGORY_RULES } from './dictionaries.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'site', 'data');

const FEATURE_WEEKS = 4; // how many weeks a project stays featured

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const simulateOld = args.includes('--simulate-old');

function readJson(file) {
  const p = path.join(DATA, file);
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : [];
}

function writeJson(file, data) {
  fs.writeFileSync(path.join(DATA, file), JSON.stringify(data, null, 2) + '\n');
}

function weeksBetween(dateIso, now = new Date()) {
  const then = new Date(dateIso);
  if (isNaN(then)) return 0;
  return Math.max(0, (now - then) / (7 * 24 * 3600 * 1000));
}

function curlJson(url, token) {
  const args = ['-s', '--max-time', '30', url];
  if (token) args.unshift('-H', `Authorization: Bearer ${token}`);
  const out = execFileSync('curl', args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 }).trim();
  if (!out) throw new Error(`empty response from ${url}`);
  const json = JSON.parse(out);
  if (json.message) throw new Error(`GitHub API error: ${json.message}`);
  return json;
}

function refreshMeta(p, token) {
  if (!p.repo) return p;
  try {
    const m = curlJson(`https://api.github.com/repos/${p.repo}`, token);
    p.stars = m.stargazers_count ?? p.stars;
    p.forks = m.forks_count ?? p.forks;
    p.last_updated = (m.pushed_at || '').slice(0, 10) || p.last_updated;
    p.description = m.description || p.description;
    p.archived = !!m.archived;
  } catch (e) {
    console.warn(`  ! 刷新 ${p.repo} 元数据失败: ${e.message}`);
  }
  return p;
}

function main() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || null;
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  let projects = readJson('projects.json').map(enrichProject);
  let backlog = readJson('backlog.json');
  const archive = readJson('archive.json');

  // normalize featured_since
  for (const p of projects) {
    if (!p.featured_since) p.featured_since = today;
  }

  console.log(`当前精选 ${projects.length} 个，候选池 ${backlog.length} 个，历史 ${archive.length} 个`);

  // 1) refresh metadata of featured projects (keep the list honest)
  console.log('刷新精选项目元数据（stars / 更新时间）…');
  projects = projects.map(p => refreshMeta(p, token));

  // 2) rotate out projects that have been featured long enough
  //    simulateOld moves the reference point FORWARD, so every existing
  //    featured project looks 5 weeks older and rotates out (demo mode).
  const keep = [];
  const retiring = [];
  const reference = simulateOld ? new Date(now.getTime() + 5 * 7 * 24 * 3600 * 1000) : now;
  for (const p of projects) {
    const age = weeksBetween(p.featured_since, reference);
    if (age >= FEATURE_WEEKS) {
      retiring.push(p);
    } else {
      keep.push(p);
    }
  }

  for (const p of retiring) {
    const entry = enrichProject({
      ...p,
      archived_at: today,
      featured_weeks: Math.round(weeksBetween(p.featured_since, now) * 10) / 10,
      category: classifyProject(p),
    });
    // avoid duplicates in archive
    const exists = archive.some(a => (a.repo || a.repo_url) === (entry.repo || entry.repo_url));
    if (!exists) archive.push(entry);
    console.log(`→ 移入历史：${entry.name}（${entry.category_label}，展示 ${entry.featured_weeks} 周）`);
  }

  // 3) pull replacements from backlog (highest stars first)
  let slots = Math.max(0, Math.min(6, 6 - keep.length)); // target ~6 featured
  slots = Math.max(slots, retiring.length > 0 ? 1 : 0) && slots; // at least try to fill if we retired something and have room
  const backlogSorted = [...backlog].sort((a, b) => (b.stars || 0) - (a.stars || 0));
  const promoted = [];
  while (slots > 0 && backlogSorted.length) {
    const cand = backlogSorted.shift();
    const entry = enrichProject({ ...refreshMeta(cand, token), featured_since: today });
    promoted.push(entry);
    slots--;
    console.log(`← 补位精选：${entry.name}（${entry.category_label}）`);
  }
  backlog = backlogSorted;

  const nextFeatured = [...keep, ...promoted];

  // 4) write results
  if (dryRun) {
    console.log('--dry-run：不写文件。下次精选：', nextFeatured.map(p => p.name).join('、'));
    return;
  }
  writeJson('projects.json', nextFeatured);
  writeJson('archive.json', archive);
  writeJson('backlog.json', backlog);
  console.log(`完成：精选 ${nextFeatured.length} 个（新增 ${promoted.length}），历史 ${archive.length} 个，剩余候选 ${backlog.length} 个`);
}

main();
