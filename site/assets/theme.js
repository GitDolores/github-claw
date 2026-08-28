/* LumeClaw · 主题系统：一键切换 + 持久化 + 跨页同步 */
(function () {
  'use strict';

  var THEMES = [
    { id: 'lume',     name: 'Lume 深空',   desc: '默认 · 深蓝紫科技风',    previewA: '#3a86ff', previewB: '#8f7bff' },
    { id: 'miku',     name: 'Miku 马卡龙', desc: '初音主题 · 粉蓝渐变',    previewA: '#ff9fc0', previewB: '#57c8e6' },
    { id: 'sakura',   name: 'Sakura 樱花', desc: '柔和粉白 · 春日清新',    previewA: '#e0709a', previewB: '#f2a3c3' },
    { id: 'terminal', name: 'Terminal 终端', desc: '极客绿 · 黑底护眼',    previewA: '#2ecc71', previewB: '#a8e6b8' }
  ];
  var STORAGE_KEY = 'lumeclaw-theme';

  function normalize(id) {
    return THEMES.some(function (t) { return t.id === id; }) ? id : 'lume';
  }

  function currentTheme() {
    return normalize(document.documentElement.getAttribute('data-theme') || storedTheme());
  }

  function storedTheme() {
    try { return normalize(localStorage.getItem(STORAGE_KEY)); } catch (e) { return 'lume'; }
  }

  function applyTheme(id, persist) {
    id = normalize(id);
    document.documentElement.setAttribute('data-theme', id);
    if (persist !== false) {
      try { localStorage.setItem(STORAGE_KEY, id); } catch (e) { /* 隐私模式忽略 */ }
    }
    document.querySelectorAll('[data-theme-current]').forEach(function (el) {
      el.textContent = themeById(id).name;
    });
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: id } }));
  }

  function themeById(id) {
    for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === id) return THEMES[i];
    return THEMES[0];
  }

  function nextTheme() {
    var cur = currentTheme();
    for (var i = 0; i < THEMES.length; i++) {
      if (THEMES[i].id === cur) return THEMES[(i + 1) % THEMES.length].id;
    }
    return 'lume';
  }

  // 构建切换按钮（注入到 nav）
  function buildSwitcher() {
    var navs = document.querySelectorAll('.site-header .nav nav');
    navs.forEach(function (nav) {
      if (nav.querySelector('.theme-switch')) return;
      var btn = document.createElement('button');
      btn.className = 'theme-switch';
      btn.type = 'button';
      btn.title = '切换主题（当前会记住你的选择）';
      btn.setAttribute('aria-label', '切换主题');
      btn.innerHTML = '<span class="theme-dot" aria-hidden="true"></span><span data-theme-current>' +
        themeById(currentTheme()).name + '</span>';
      btn.addEventListener('click', function () {
        applyTheme(nextTheme());
      });
      // 长按 / 右键弹出完整菜单
      var menuTimer = null;
      btn.addEventListener('contextmenu', function (e) { e.preventDefault(); openMenu(btn); });
      btn.addEventListener('touchstart', function () {
        menuTimer = setTimeout(function () { openMenu(btn); }, 550);
      }, { passive: true });
      btn.addEventListener('touchend', function () { clearTimeout(menuTimer); });
      nav.appendChild(btn);
    });
  }

  function openMenu(anchor) {
    closeMenu();
    var menu = document.createElement('div');
    menu.className = 'theme-menu';
    menu.setAttribute('role', 'menu');
    THEMES.forEach(function (t) {
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'theme-item' + (t.id === currentTheme() ? ' active' : '');
      item.setAttribute('role', 'menuitem');
      item.innerHTML = '<span class="theme-dot" style="background:linear-gradient(135deg,' +
        t.previewA + ',' + t.previewB + ')" aria-hidden="true"></span><span class="theme-item-text"><strong>' +
        t.name + '</strong><em>' + t.desc + '</em></span>';
      item.addEventListener('click', function () { applyTheme(t.id); closeMenu(); });
      menu.appendChild(item);
    });
    document.body.appendChild(menu);
    var r = anchor.getBoundingClientRect();
    menu.style.top = (r.bottom + 8) + 'px';
    menu.style.right = Math.max(8, window.innerWidth - r.right) + 'px';
    setTimeout(function () {
      document.addEventListener('click', menuOutside, { once: true });
      document.addEventListener('keydown', menuEsc, { once: true });
    }, 0);
  }

  function closeMenu() {
    var m = document.querySelector('.theme-menu');
    if (m) m.remove();
  }
  function menuOutside(e) {
    var m = document.querySelector('.theme-menu');
    if (m && !m.contains(e.target)) closeMenu();
    else if (m) document.addEventListener('click', menuOutside, { once: true });
  }
  function menuEsc(e) {
    if (e.key === 'Escape') closeMenu();
    else document.addEventListener('keydown', menuEsc, { once: true });
  }

  // 跨标签页同步
  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY && e.newValue) applyTheme(e.newValue, false);
  });

  // 立即应用（防闪烁：各页 head 内联脚本已提前读取 localStorage）
  applyTheme(storedTheme(), false);

  function init() { buildSwitcher(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.LumeClawTheme = { apply: applyTheme, current: currentTheme, list: THEMES };
})();
