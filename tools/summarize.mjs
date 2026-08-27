#!/usr/bin/env node
// Generate a categorized summary of all featured + archived projects.
// Writes site/data/summary.json for the history page.
//
// Usage:
//   node tools/summarize.mjs            # write summary.json
//   node tools/summarize.mjs --print    # also print to stdout

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORY_RULES, classifyProject, enrichProject } from './dictionaries.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'site', 'data');

const args = process.argv.slice(2);
const doPrint = args.includes('--print');

function readJson(f) {
  const p = path.join(DATA, f);
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : [];
}

function loadReport(repo) {
  if (!repo) return null;
  const p = path.join(DATA, 'reports', repo.replace('/', '__') + '.json');
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function fmtNum(n) {
  if (n == null) return '0';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
  return String(n);
}

function topLangOf(p) {
  const r = loadReport(p.repo);
  if (r && r.languages && r.languages.length) return r.languages[0].label;
  return null;
}

function main() {
  const featured = readJson('projects.json').map(p => ({ ...p, category: p.category || classifyProject(p) }));
  const archive = readJson('archive.json').map(p => ({ ...p, category: p.category || classifyProject(p) }));

  const groups = CATEGORY_RULES.map(rule => ({
    id: rule.id,
    label: rule.label,
    speak: rule.speak,
    featured: [],
    archived: [],
  }));
  const byId = Object.fromEntries(groups.map(g => [g.id, g]));

  for (const p of featured) {
    const cat = p.category && byId[p.category] ? p.category : 'other';
    byId[cat].featured.push({
      name: p.name,
      repo: p.repo || null,
      repo_url: p.repo_url,
      description: p.description,
      stars: p.stars || 0,
      last_updated: p.last_updated,
      featured_since: p.featured_since,
      language: topLangOf(p),
    });
  }
  for (const p of archive) {
    const cat = p.category && byId[p.category] ? p.category : 'other';
    byId[cat].archived.push({
      name: p.name,
      repo: p.repo || null,
      repo_url: p.repo_url,
      description: p.description,
      stars: p.stars || 0,
      last_updated: p.last_updated,
      featured_since: p.featured_since,
      archived_at: p.archived_at,
      featured_weeks: p.featured_weeks,
      language: topLangOf(p),
    });
  }

  // per-category one-liner summary (plain language)
  const summaries = [];
  const totalAll = featured.length + archive.length;
  for (const g of groups) {
    const n = g.featured.length + g.archived.length;
    if (n === 0) continue;
    const top = [...g.featured, ...g.archived].sort((a, b) => (b.stars || 0) - (a.stars || 0));
    const langs = {};
    for (const p of [...g.featured, ...g.archived]) {
      if (p.language) langs[p.language] = (langs[p.language] || 0) + 1;
    }
    const langStr = Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 2).map(l => l[0]).join(' + ');
    const starSum = top.reduce((s, p) => s + (p.stars || 0), 0);
    summaries.push({
      id: g.id,
      label: g.label,
      speak: g.speak,
      count: n,
      featured_now: g.featured.length,
      top_projects: top.slice(0, 3).map(p => ({ name: p.name, stars: p.stars, repo_url: p.repo_url })),
      main_language: langStr || null,
      total_stars: starSum,
      summary: `${g.label}（${g.speak}）：收录 ${n} 个项目（正在精选 ${g.featured.length} 个）。` +
        (top[0] ? `最热门的是「${top[0].name}」（⭐${fmtNum(top[0].stars)}）` : '') +
        (langStr ? `；主力语言 ${langStr}` : '') +
        `。`,
    });
  }

  const out = {
    generated_at: new Date().toISOString(),
    total_projects: totalAll,
    total_featured: featured.length,
    total_archived: archive.length,
    total_stars: [...featured, ...archive].reduce((s, p) => s + (p.stars || 0), 0),
    categories: summaries,
    headline: `共收录 ${totalAll} 个项目：当前精选 ${featured.length} 个、历史 ${archive.length} 个，覆盖 ${summaries.length} 个分类。` +
      (summaries.length ? `星数最多的分类是「${[...summaries].sort((a, b) => b.total_stars - a.total_stars)[0].label}」。` : ''),
  };

  fs.writeFileSync(path.join(DATA, 'summary.json'), JSON.stringify(out, null, 2) + '\n');
  if (doPrint) {
    console.log(out.headline);
    for (const s of summaries) console.log(' -', s.summary);
  } else {
    console.log(`summary.json 已生成：${summaries.length} 个分类，${totalAll} 个项目`);
  }
}

main();
