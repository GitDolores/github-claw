// Report page: loads data/reports/<owner__repo>.json and renders it.
// Falls back to live progress polling when the report doesn't exist yet.

(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  function getRepoParam() {
    const p = new URLSearchParams(location.search).get('repo');
    return p ? p.replace(/\.git$/, '') : '';
  }

  function slug(repo) { return repo.replace('/', '__'); }

  function fmtNum(n) {
    if (n == null) return '-';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
    return String(n);
  }

  function fmtBytes(b) {
    if (b == null) return '-';
    if (b > 1e9) return (b / 1e9).toFixed(1) + ' GB';
    if (b > 1e6) return (b / 1e6).toFixed(1) + ' MB';
    if (b > 1e3) return (b / 1e3).toFixed(1) + ' KB';
    return b + ' B';
  }

  function fmtDate(iso) {
    try { return new Date(iso).toLocaleString('zh-CN', { hour12: false }); }
    catch { return iso; }
  }

  // ---------- render report ----------
  function renderReport(repo, d) {
    $('report-title').textContent = d.meta.full_name || repo;
    $('report-lead').textContent = (d.meta.description || '源码分析报告（通俗版）').slice(0, 200);
    $('report-meta').innerHTML =
      '⭐ ' + fmtNum(d.meta.stars) + ' · 🍴 ' + fmtNum(d.meta.forks) +
      ' · 主要语言 ' + esc(d.meta.language || (d.languages[0] && d.languages[0].label) || '未知') +
      (d.meta.license && d.meta.license !== 'NOASSERTION' ? ' · 许可证 ' + esc(d.meta.license) : '') +
      (d.meta.archived ? ' · <strong>已归档</strong>' : '');

    $('ov-text').textContent = d.overview || '';

    const stats = [
      ['文件总数', d.stats.files != null ? fmtNum(d.stats.files) : null],
      ['源码规模', d.stats.bytes ? fmtBytes(d.stats.bytes) : null],
      ['抽样文件', d.stats.sampled != null ? fmtNum(d.stats.sampled) + ' 个' : null],
      ['开放 Issue', fmtNum(d.meta.open_issues)],
    ].filter(s => s[1]);
    $('ov-stats').innerHTML = stats.map(([k, v]) =>
      '<div class="stat"><div class="stat-v">' + esc(v) + '</div><div class="stat-k">' + esc(k) + '</div></div>').join('');

    // stack cards
    const stackCards = (d.frameworks || []).map(f =>
      '<div class="card"><h3>' + esc(f.label) + '</h3>' +
      '<p>' + esc(f.speak || '') + '</p>' +
      (f.category ? '<div class="tags"><span class="tag">' + esc(f.category) + '</span></div>' : '') +
      '</div>').join('');
    $('stack-cards').innerHTML = stackCards || '<div class="card"><p>未检测到显式框架（可能是一个轻量脚本项目）。</p></div>';

    // languages
    const langs = (d.languages || []).filter(l => l.label);
    const total = langs.reduce((s, l) => s + (l.bytes || l.files || 0), 0) || 1;
    $('lang-bar').innerHTML = langs.map(l => {
      const w = ((l.bytes || l.files || 0) / total * 100);
      return '<div class="lang-seg" style="width:' + w.toFixed(1) + '%;background:' + (l.color || '#6b8cff') + '" title="' + esc(l.label) + ' ' + w.toFixed(1) + '%"></div>';
    }).join('') + '<div class="lang-legend">' + langs.map(l =>
      '<span><i style="background:' + (l.color || '#6b8cff') + '"></i>' + esc(l.label) +
      (l.speak ? '（' + esc(l.speak) + '）' : '') + '</span>').join('') + '</div>';

    // dir tree
    const tree = d.dir_tree || [];
    $('dir-tree').innerHTML = tree.map(t =>
      '<div class="dir-item"><div class="dir-name">' + esc(t.dir === '/' ? '（仓库根目录）' : t.dir) + '</div>' +
      '<div class="dir-desc">' + esc(t.meaning || '（按名字猜：普通资源/代码目录') + ')' +
      ' · ' + t.count + ' 个文件</div>' +
      (t.sample && t.sample.length ? '<div class="dir-sample">' + t.sample.map(esc).join(' · ') + '</div>' : '') +
      '</div>').join('') || '<p>（未提供目录结构）</p>';

    // core modules
    $('module-cards').innerHTML = (d.core_modules || []).map(m =>
      '<div class="card"><h3><code>' + esc(m.path) + '</code></h3>' +
      '<p>' + esc(m.why || '关键源码文件（按重要度挑选）') + '</p>' +
      '<div class="meta">' + esc(m.size || '') + '</div></div>').join('') ||
      '<div class="card"><p>未做源码级扫描。</p></div>';

    // data flow
    $('flow-steps').innerHTML = (d.data_flow || []).map(s => '<li>' + esc(s) + '</li>').join('');

    // patterns
    $('pattern-list').innerHTML = (d.patterns || []).map(p =>
      '<div class="pattern-item"><span class="pattern-badge ' + (p.severity === 'notable' ? 'notable' : '') + '">' + esc(p.pattern) + '</span>' +
      '<span class="pattern-speak">' + esc(p.speak) + '</span>' +
      (p.where ? '<code class="pattern-where">' + esc(p.where) + '</code>' : '') +
      '</div>').join('') || '<p>未检测到显著模式。</p>';

    // doc quotes
    $('doc-quotes').innerHTML = (d.doc_quotes || []).map(q =>
      '<blockquote class="doc-quote"><p>' + esc(q.text) + '</p><cite>—— ' + esc(q.file) + '</cite></blockquote>').join('') ||
      '<p>（未摘录到文档段落）</p>';

    // tips
    $('tip-list').innerHTML = (d.read_suggestions || []).map(t =>
      '<div class="item"><strong>' + esc(t.title) + '</strong><span>' + esc(t.body) + '</span></div>').join('');

    $('raw-link').href = 'data/reports/' + encodeURIComponent(slug(repo)) + '.json';
    $('analyzer-version').textContent = d.analyzer || '-';
    $('generated-at').textContent = fmtDate(d.generated_at);

    $('progress-section').hidden = true;
    $('report-body').hidden = false;
  }

  // ---------- progress polling ----------
  let pollTimer = null;

  function renderProgress(repo, st) {
    $('progress-section').hidden = false;
    $('report-body').hidden = true;
    $('report-lead').textContent = '「' + repo + '」还没有分析报告——别急，机器人正在读代码。';
    const pct = Math.max(0, Math.min(100, st.progress || 0));
    $('progress-bar').style.width = pct + '%';
    $('progress-note').textContent = st.note || st.stage || '分析中……';
    $('progress-detail').textContent =
      '阶段：' + (st.stage || '-') + ' · 进度 ' + pct + '%' +
      (st.updated_at ? ' · 更新于 ' + fmtDate(st.updated_at) : '');
  }

  function startPolling(repo) {
    const tryOnce = () => {
      fetch('data/analysis-status.json', { cache: 'no-store' })
        .then(r => r.ok ? r.json() : null)
        .then(st => {
          if (st && st.repo === repo && st.stage !== 'done' && st.stage !== 'all-done') {
            renderProgress(repo, st);
            return; // keep polling
          }
          // status says done (or another repo): try loading the report
          return fetch('data/reports/' + encodeURIComponent(slug(repo)) + '.json', { cache: 'no-store' })
            .then(r => {
              if (!r.ok) throw new Error('not found');
              return r.json();
            })
            .then(d => {
              clearInterval(pollTimer);
              renderReport(repo, d);
            })
            .catch(() => {
              if (st) renderProgress(repo, st); // still working, show whatever we have
            });
        })
        .catch(() => { /* transient network error, keep polling */ });
    };
    tryOnce();
    pollTimer = setInterval(tryOnce, 10000);
  }

  // ---------- boot ----------
  const repo = getRepoParam();
  if (!repo) {
    $('report-lead').textContent = '缺少 ?repo=owner/name 参数。回到首页挑一个项目吧。';
  } else {
    fetch('data/reports/' + encodeURIComponent(slug(repo)) + '.json')
      .then(r => {
        if (!r.ok) throw new Error('no report');
        return r.json();
      })
      .then(d => renderReport(repo, d))
      .catch(() => startPolling(repo));
  }
})();
