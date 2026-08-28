document.addEventListener('DOMContentLoaded', async () => {
  // build time
  const buildEl = document.getElementById('build-time');
  if (buildEl) buildEl.textContent = new Date().toISOString().slice(0,10);

  // load projects
  const projectsList = document.getElementById('projects-list');
  try {
    const res = await fetch('data/projects.json');
    if (!res.ok) throw new Error('Network response not ok');
    const projects = await res.json();

    // which reports already exist? (cache check)
    const reportFlags = await Promise.all(projects.map(async p => {
      const slug = p.repo_url.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '').replace('/', '__');
      try {
        const r = await fetch('data/reports/' + encodeURIComponent(slug) + '.json', { method: 'HEAD' });
        return { slug, done: r.ok };
      } catch {
        return { slug, done: false };
      }
    }));

    projects.forEach((p, i) => {
      const slug = reportFlags[i].slug;
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3><a href="${p.repo_url}" target="_blank" rel="noopener noreferrer">${escapeHTML(p.name)}</a></h3>
        <p>${escapeHTML(p.description)}</p>
        <div class="tags">${(p.tags||[]).map(t=>`<span class="tag">${escapeHTML(t)}</span>`).join('')}</div>
        <div class="meta">⭐ ${p.stars || 0} · 最近更新 ${p.last_updated || '-'} · <a href="${p.repo_url}" target="_blank" rel="noopener noreferrer">查看</a></div>
        <div class="card-actions"><a class="analyze-link${reportFlags[i].done ? ' done' : ''}" href="report.html?repo=${encodeURIComponent(slug.replace('__','/'))}">${reportFlags[i].done ? '📖 查看分析报告' : '🤖 分析这个项目'}</a></div>
      `;
      projectsList.appendChild(card);
    });
  } catch (err) {
    console.error('加载项目失败', err);
    if (projectsList) projectsList.innerHTML = '<div class="card"><p>无法加载精选项目数据。</p></div>';
  }

  // draw growth chart (示例数据)
  const ctx = document.getElementById('growthChart');
  if (ctx && window.Chart) {
    const labels = ['6周前','5周前','4周前','3周前','2周前','上周','本周'];
    const data = [8,12,22,29,37,48,62];
    const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const drawChart = () => {
      if (window.__growthChart) window.__growthChart.destroy();
      window.__growthChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: '每周 Stars 增长',
            data,
            borderColor: cssVar('--chart-line'),
            backgroundColor: cssVar('--chart-fill'),
            tension: 0.28,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: cssVar('--card')
          }]
        },
        options: {
          responsive: true,
          plugins: {legend: {display: false}},
          scales: {
            x: {ticks:{color: cssVar('--chart-tick')}, grid:{display:false}},
            y: {beginAtZero:true, ticks:{color: cssVar('--chart-tick')}, grid:{color: cssVar('--chart-grid')}}
          }
        }
      });
    };
    drawChart();
    document.addEventListener('themechange', drawChart);
  }

  // simple keyboard focus enhancement for cards
  document.querySelectorAll('.card a').forEach(a=>{a.setAttribute('tabindex','0')});

});

function escapeHTML(s){
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
