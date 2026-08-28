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
      '<div class="dir-desc">' + esc(t.meaning || '普通资源/代码目录') + ' · ' + t.count + ' 个文件</div>' +
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

    // flow graph (SVG diagram)
    renderFlowGraph(d.flow_graph);

    // scenarios
    $('scenario-cards').innerHTML = (d.scenarios || []).map(s =>
      '<div class="card scenario-card"><h3>✅ 适合</h3><p>' + esc(s.when) + '</p>' +
      '<h3>❌ 不适合</h3><p>' + esc(s.not) + '</p></div>').join('') ||
      '<div class="card"><p>（未生成场景建议）</p></div>';

    // interfaces
    $('iface-list').innerHTML = (d.interfaces || []).map(i =>
      '<div class="pattern-item"><span class="pattern-badge">' + esc(i.kind) + '</span>' +
      '<span class="pattern-speak">' + esc(i.speak || '') + '</span>' +
      (i.where ? '<code class="pattern-where">' + esc(i.where) + '</code>' : '') +
      '</div>').join('') || '<p>未检测到显式对外接口（可能是内部工具或库内模块）。</p>';

    // demo links
    const demos = d.demo_links || [];
    $('demo-links').innerHTML = demos.length
      ? demos.map(x => '<div class="pattern-item"><span class="pattern-badge">' + esc(x.kind) + '</span>' +
          '<a href="' + esc(x.url) + '" target="_blank" rel="noopener">' + esc(x.url.length > 80 ? x.url.slice(0, 80) + '…' : x.url) + '</a></div>').join('')
      : '<p>README 里没有找到演示视频/截图/在线试用链接。可以到项目主页看看 Release 页的说明。</p>';

    // dependencies
    const deps = d.dependencies || {};
    const depCount = (deps.runtime || []).length + (deps.build || []).length;
    $('dep-list').innerHTML = deps.manifest
      ? '<p class="section-lead">依赖清单：<code>' + esc(deps.manifest) + '</code>，运行时 ' + (deps.runtime || []).length + ' 个、开发时 ' + (deps.build || []).length + ' 个。</p>' +
        '<div class="dep-tags">' + (deps.runtime || []).map(x =>
          '<span class="dep-tag" title="' + esc(x.note || '') + '">' + esc(x.name) + (x.note ? '<em>' + esc(x.note) + '</em>' : '') + '</span>').join('') + '</div>'
      : '<p>没有找到标准依赖清单（package.json / requirements.txt 等），可能是无依赖的纯源码项目。</p>';

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

    // community
    renderCommunity(d);

    // competitors
    const comp = d.competitors || { matched: 'none', list: [] };
    $('competitor-cards').innerHTML = (comp.list || []).map(c =>
      '<div class="card"><h3><a href="https://github.com/' + esc(c.repo) + '" target="_blank" rel="noopener">' + esc(c.name) + '</a></h3>' +
      '<p>' + esc(c.edge) + '</p>' +
      '<div class="meta">' + esc(c.repo) + '</div></div>').join('') ||
      '<div class="card"><p>（暂无已知的同类项目对比数据）</p></div>';

    // rework ideas
    const diffColor = { '入门': 'easy', '进阶': 'mid', '硬核': 'hard' };
    $('rework-list').innerHTML = (d.rework_ideas || []).map(r =>
      '<div class="pattern-item"><span class="pattern-badge ' + (diffColor[r.difficulty] || '') + '">' + esc(r.difficulty) + '</span>' +
      '<span class="pattern-speak">' + esc(r.idea) + '</span></div>').join('') ||
      '<p>（未生成改造建议）</p>';

    // tips
    $('tip-list').innerHTML = (d.read_suggestions || []).map(t =>
      '<div class="item"><strong>' + esc(t.title) + '</strong><span>' + esc(t.body) + '</span></div>').join('');

    // pitfalls
    $('pitfall-list').innerHTML = (d.pitfalls || []).map(p =>
      '<div class="pitfall-item"><div class="pitfall-problem">⚠️ ' + esc(p.pit) + '</div>' +
      '<div class="pitfall-fix">✅ ' + esc(p.fix) + '</div></div>').join('') ||
      '<p>（未生成踩坑清单）</p>';

    // raw data + actions
    $('raw-link').href = 'data/reports/' + encodeURIComponent(slug(repo)) + '.json';
    $('download-report').href = 'data/reports/' + encodeURIComponent(slug(repo)) + '.json';
    $('download-report').setAttribute('download', slug(repo) + '.json');
    $('copy-report').addEventListener('click', function (ev) {
      ev.preventDefault();
      copyText(JSON.stringify(d, null, 2), ev.target, '📋 复制报告 JSON');
    });
    const cloneCmd = 'git clone https://github.com/' + repo + '.git';
    $('clone-cmd').addEventListener('click', function (ev) {
      ev.preventDefault();
      copyText(cloneCmd, ev.target, '📦 一键复制克隆命令');
    });
    $('analyzer-version').textContent = d.analyzer || '-';
    $('generated-at').textContent = fmtDate(d.generated_at);

    $('progress-section').hidden = true;
    $('report-body').hidden = false;
  }

  // ---------- flow graph ----------
  function renderFlowGraph(g) {
    const box = $('flow-graph');
    if (!g || !g.nodes || !g.nodes.length) { box.innerHTML = ''; return; }
    const nodeById = {};
    g.nodes.forEach(n => { nodeById[n.id] = n; });

    // compact geometry
    const W = 118, H = 40, GAPX = 42, GAPY = 14;

    // main chain left→right; side branches (db/utils) stack under the core column
    const chain = ['user', 'api', 'entry', 'dispatch', 'core', 'output'];
    const sides = ['db', 'utils'];
    const layout = [];
    let col = 0, coreCol = 0;
    chain.forEach(id => {
      if (!nodeById[id]) return;
      if (id === 'core') coreCol = col;
      layout.push({ id, col: col++, row: 0 });
    });
    sides.forEach(id => {
      if (!nodeById[id]) return;
      layout.push({ id, col: coreCol, row: layout.filter(n => n.col === coreCol).length });
    });

    const cols = Math.max.apply(null, layout.map(n => n.col)) + 1;
    const rows = Math.max.apply(null, layout.map(n => n.row)) + 1;
    layout.forEach(n => {
      n.x = n.col * (W + GAPX) + 8;
      n.y = 10 + n.row * (H + GAPY);
    });
    const svgW = cols * (W + GAPX) - GAPX + 16;
    const svgH = 10 + rows * (H + GAPY) - GAPY + 8;

    // merge a→b + b→a into a single double-arrow edge
    const edgeMap = new Map();
    g.edges.forEach(e => {
      if (!nodeById[e[0]] || !nodeById[e[1]]) return;
      const key = [e[0], e[1]].sort().join('|');
      const cur = edgeMap.get(key);
      if (!cur) edgeMap.set(key, { from: e[0], to: e[1], both: false });
      else if (cur.from === e[1] && cur.to === e[0]) cur.both = true;
    });

    const pos = {};
    layout.forEach(n => { pos[n.id] = n; });
    let edgesSvg = '';
    edgeMap.forEach(({ from, to, both }) => {
      const a = pos[from], b = pos[to];
      let x1, y1, x2, y2, d;
      if (Math.abs(a.x - b.x) < 2 && b.y > a.y) {
        // vertical: bottom of a → top of b
        x1 = a.x + W / 2; y1 = a.y + H; x2 = b.x + W / 2; y2 = b.y;
        d = 'M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2;
      } else {
        const right = b.x > a.x;
        x1 = right ? a.x + W : a.x; y1 = a.y + H / 2;
        x2 = right ? b.x : b.x + W; y2 = b.y + H / 2;
        if (Math.abs(y1 - y2) < 2) {
          d = 'M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2;
        } else {
          const mx = (x1 + x2) / 2;
          d = 'M' + x1 + ' ' + y1 + ' C' + mx + ' ' + y1 + ', ' + mx + ' ' + y2 + ', ' + x2 + ' ' + y2;
        }
      }
      const markers = both ? ' marker-start="url(#arrow)" marker-end="url(#arrow)"' : ' marker-end="url(#arrow)"';
      edgesSvg += '<path class="fg-edge" d="' + d + '"' + markers + '/>';
    });

    const typeClass = { user: 'fg-user', api: 'fg-api', entry: 'fg-entry', dispatch: 'fg-dispatch', core: 'fg-core', utils: 'fg-utils', db: 'fg-db', output: 'fg-output' };
    let nodesSvg = '';
    layout.forEach(n => {
      const meta = nodeById[n.id] || {};
      nodesSvg += '<g class="fg-node ' + (typeClass[n.id] || '') + '" transform="translate(' + n.x + ',' + n.y + ')">' +
        '<title>' + esc(meta.label || n.id) + (fgTypeLabel(n.id) ? '（' + fgTypeLabel(n.id) + '）' : '') + '</title>' +
        '<rect width="' + W + '" height="' + H + '" rx="8"/>' +
        '<text x="' + (W / 2) + '" y="' + (H / 2 - 2) + '" text-anchor="middle" class="fg-label">' + esc(truncate(meta.label || n.id, 13)) + '</text>' +
        '<text x="' + (W / 2) + '" y="' + (H / 2 + 10) + '" text-anchor="middle" class="fg-type">' + esc(fgTypeLabel(n.id)) + '</text>' +
        '</g>';
    });
    box.innerHTML = '<svg viewBox="0 0 ' + svgW + ' ' + svgH + '" width="' + svgW + '" height="' + svgH + '" role="img" aria-label="数据流图">' +
      '<defs><marker id="arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
      '<path d="M 0 0 L 10 5 L 0 10 z" fill="#8fa3d9"/></marker></defs>' +
      edgesSvg + nodesSvg + '</svg>';
  }

  function fgTypeLabel(id) {
    return { user: '输入', api: '接口层', entry: '入口', dispatch: '分发', core: '核心逻辑', utils: '工具', db: '存储', output: '输出' }[id] || '';
  }

  function truncate(s, n) {
    return String(s).length > n ? String(s).slice(0, n - 1) + '…' : s;
  }

  // ---------- community ----------
  function renderCommunity(d) {
    const c = d.community || {};
    const m = d.meta || {};
    const stats = [
      ['贡献者', c.contributors],
      ['最新版本', c.latest_release ? c.latest_release.tag : null],
      ['发布时间', c.latest_release && c.latest_release.published_at ? c.latest_release.published_at.slice(0, 10) : null],
      ['仓库年龄', c.repo_age_days != null ? Math.floor(c.repo_age_days / 365) + ' 年' : null],
      ['上次提交', m.pushed_at ? m.pushed_at.slice(0, 10) : null],
    ].filter(s => s[1]);
    $('community-stats').innerHTML = stats.map(([k, v]) =>
      '<div class="stat"><div class="stat-v">' + esc(v) + '</div><div class="stat-k">' + esc(k) + '</div></div>').join('') ||
      '<p class="section-lead">（未获取社区数据）</p>';
    const verdict = (c.verdict || []).map(v => '<li>' + esc(v) + '</li>').join('');
    $('community-verdict').innerHTML = verdict
      ? '<ul class="verdict-list">' + verdict + '</ul>' +
        (c.latest_release && c.latest_release.notes_excerpt
          ? '<blockquote class="doc-quote"><p>' + esc(c.latest_release.notes_excerpt) + '</p><cite>—— 最新 Release 说明摘录（' + esc(c.latest_release.tag) + '）</cite></blockquote>'
          : '') +
        '<p class="section-lead">更多社区资源：<a href="https://github.com/' + esc(d.meta.full_name) + '/releases" target="_blank" rel="noopener">Releases 版本历史</a> · <a href="https://github.com/' + esc(d.meta.full_name) + '/issues" target="_blank" rel="noopener">Issues 问答区</a> · <a href="https://github.com/' + esc(d.meta.full_name) + '/blob/' + esc(d.meta.default_branch || 'main') + '/README.md" target="_blank" rel="noopener">README</a></p>'
      : '<p class="section-lead">（未生成活跃度评估）</p>';
  }

  // ---------- copy helper ----------
  function copyText(text, el, original) {
    const done = function () {
      const old = el.textContent;
      el.textContent = '✓ 已复制';
      setTimeout(function () { el.textContent = old || original; }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text);
      done();
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
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
