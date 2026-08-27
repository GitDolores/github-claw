// History page: category-grouped view of all featured (current + archived)
// projects, with a live aggregated summary from summary.json.

(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  function fmtNum(n) {
    if (n == null) return '0';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
    return String(n);
  }

  function fmtDate(iso) {
    if (!iso) return '-';
    return iso;
  }

  function slug(repo) { return repo ? repo.replace('/', '__') : ''; }

  function renderProjectRow(p, isFeatured) {
    const reportSlug = slug(p.repo);
    const analyzeHref = reportSlug
      ? 'report.html?repo=' + encodeURIComponent(p.repo)
      : p.repo_url;
    return (
      '<div class="hist-item' + (isFeatured ? '' : ' faded') + '">' +
      '<div class="hist-main">' +
      '<a class="hist-name" href="' + esc(p.repo_url || '#') + '" target="_blank" rel="noopener noreferrer">' + esc(p.name) + '</a>' +
      '<span class="hist-badge">' + (isFeatured ? '● 精选中' : '已归档') + '</span>' +
      '</div>' +
      '<div class="hist-desc">' + esc(p.description || '') + '</div>' +
      '<div class="hist-meta">⭐ ' + fmtNum(p.stars) +
      (p.language ? ' · ' + esc(p.language) : '') +
      (p.featured_since ? ' · 上精选 ' + fmtDate(p.featured_since) : '') +
      (!isFeatured && p.archived_at ? ' · 归档 ' + fmtDate(p.archived_at) : '') +
      (!isFeatured && p.featured_weeks != null ? ' · 展示 ' + p.featured_weeks + ' 周' : '') +
      (reportSlug ? ' · <a href="' + esc(analyzeHref) + '">分析报告</a>' : '') +
      '</div>' +
      '</div>'
    );
  }

  async function loadJson(url) {
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error(url + ' ' + r.status);
    return r.json();
  }

  async function reportExists(repo) {
    if (!repo) return false;
    try {
      const r = await fetch('data/reports/' + encodeURIComponent(slug(repo)) + '.json', { method: 'HEAD' });
      return r.ok;
    } catch { return false; }
  }

  async function main() {
    let summary, featured, archive;
    try {
      [summary, featured, archive] = await Promise.all([
        loadJson('data/summary.json'),
        loadJson('data/projects.json'),
        loadJson('data/archive.json'),
      ]);
    } catch (e) {
      $('headline').textContent = '数据加载失败：' + e.message;
      return;
    }

    // headline
    $('headline').innerHTML = esc(summary.headline || '') +
      ' 更新于 ' + esc((summary.generated_at || '').replace('T', ' ').slice(0, 16));

    // summary blocks
    $('summary-list').innerHTML = (summary.categories || []).map(c =>
      '<div class="sum-block">' +
      '<div class="sum-head"><span class="sum-label">' + esc(c.label) + '</span>' +
      '<span class="sum-count">' + c.count + ' 个项目 · 精选中 ' + c.featured_now + '</span></div>' +
      '<p class="sum-speak">' + esc(c.speak || '') + '</p>' +
      '<p class="sum-text">' + esc(c.summary || '') + '</p>' +
      '</div>'
    ).join('') || '<p>暂无总结数据。</p>';

    // group projects by category (featured + archived merged)
    const groups = {};
    const seen = new Set();
    const push = (p, isFeatured) => {
      const key = p.repo || p.repo_url;
      if (seen.has(key)) return; // archived copy wins (both list it while transitioning)
      seen.add(key);
      const cat = p.category_label || '其他';
      (groups[cat] ??= []).push({ p, isFeatured });
    };
    archive.forEach(p => push(p, false));
    featured.forEach(p => push(p, true));

    const catOrder = new Map((summary.categories || []).map(c => [c.label, c.count]));
    const ordered = Object.entries(groups)
      .sort((a, b) => (catOrder.get(b[0]) || 0) - (catOrder.get(a[0]) || 0));

    // filter bar
    const cats = ['全部', ...ordered.map(([c]) => c)];
    $('filter-bar').innerHTML = cats.map((c, i) =>
      '<button class="filter-btn' + (i === 0 ? ' active' : '') + '" data-cat="' + esc(c) + '">' + esc(c) + '</button>'
    ).join('');

    // render groups
    $('history-groups').innerHTML = ordered.map(([cat, items]) => {
      const itemsSorted = items.sort((a, b) => (b.p.stars || 0) - (a.p.stars || 0));
      return (
        '<div class="hist-group" data-cat="' + esc(cat) + '">' +
        '<h3 class="hist-cat">' + esc(cat) + ' <span class="hist-cat-count">' + items.length + '</span></h3>' +
        itemsSorted.map(({ p, isFeatured }) => renderProjectRow(p, isFeatured)).join('') +
        '</div>'
      );
    }).join('') || '<p>暂无历史项目。</p>';

    // filter behavior
    $('filter-bar').addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      $('filter-bar').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      document.querySelectorAll('.hist-group').forEach(g => {
        g.style.display = (cat === '全部' || g.dataset.cat === cat) ? '' : 'none';
      });
    });

    // annotate report links for cached reports
    for (const el of document.querySelectorAll('a[href^="report.html?repo="]')) {
      const repo = new URL(el.href, location.href).searchParams.get('repo');
      if (repo && await reportExists(repo)) el.textContent = '📖 分析报告';
    }
  }

  main();
})();
