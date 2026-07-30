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
    projects.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3><a href="${p.repo_url}" target="_blank" rel="noopener noreferrer">${escapeHTML(p.name)}</a></h3>
        <p>${escapeHTML(p.description)}</p>
        <div class="tags">${(p.tags||[]).map(t=>`<span class="tag">${escapeHTML(t)}</span>`).join('')}</div>
        <div class="meta">⭐ ${p.stars || 0} · 最近更新 ${p.last_updated || '-'} · <a href="${p.repo_url}" target="_blank" rel="noopener noreferrer">查看</a></div>
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
    new Chart(ctx.getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: '每周 Stars 增长',
          data,
          borderColor: '#6b8cff',
          backgroundColor: 'rgba(107,140,255,0.12)',
          tension: 0.28,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        plugins: {legend: {display: false}},
        scales: {
          x: {ticks:{color:'#9aa7c0'}, grid:{display:false}},
          y: {beginAtZero:true, ticks:{color:'#9aa7c0'}, grid:{color:'rgba(255,255,255,0.03)'}}
        }
      }
    });
  }

  // simple keyboard focus enhancement for cards
  document.querySelectorAll('.card a').forEach(a=>{a.setAttribute('tabindex','0')});

});

function escapeHTML(s){
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
