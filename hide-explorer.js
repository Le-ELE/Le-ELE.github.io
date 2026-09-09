(function() {
  var path = window.location.pathname.replace(/\/+$/, '');
  var isLoginRoot = path === '/estudiantes' || path === '/estudiantes/';

  // === Login page for /estudiantes/ ===
  if (isLoginRoot) {
    document.addEventListener('DOMContentLoaded', function() {
      document.querySelectorAll('.left.sidebar,.right.sidebar,.breadcrumb-container,footer.page-footer,.page footer,.graph,.explorer,.search,.page-header,.page-listing').forEach(function(el) {
        el.style.display = 'none';
      });
      var qb = document.getElementById('quartz-body');
      if (qb) {
        qb.style.gridTemplate = '"grid-center" 1fr / 1fr';
        qb.style.gap = '0';
        qb.style.padding = '0';
      }
      var center = document.querySelector('.center');
      if (center) {
        center.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;min-height:80vh;font-family:var(--bodyFont,sans-serif)">' +
          '<div style="text-align:center;max-width:400px;width:90%">' +
          '<h1 style="font-size:2rem;margin-bottom:0.5rem;color:#111">Estudiantes</h1>' +
          '<p style="color:#666;margin-bottom:1.5rem;font-size:16px">Ingresa tu código de estudiante para acceder a tus notas.</p>' +
          '<form id="login-form" style="display:flex;flex-direction:column;gap:12px">' +
          '<input id="login-input" type="text" placeholder="Ej: Leo-jxbun0" autocomplete="off" style="padding:14px 16px;font-size:16px;border:2px solid #ddd;border-radius:8px;outline:none;transition:border-color 0.2s;width:100%;box-sizing:border-box" />' +
          '<button type="submit" style="padding:14px;font-size:16px;background:#2563eb;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;transition:background 0.2s">Entrar</button>' +
          '</form>' +
          '<p id="login-error" style="color:#e53e3e;margin-top:12px;font-size:14px;display:none">Código no encontrado. Intenta de nuevo.</p>' +
          '</div></div>';
        var form = document.getElementById('login-form');
        var input = document.getElementById('login-input');
        var error = document.getElementById('login-error');
        form.onsubmit = function(e) {
          e.preventDefault();
          var code = input.value.trim();
          if (code) {
            window.location.href = '/estudiantes/' + code + '/';
          }
        };
        input.focus();
        // Also navigate on enter in case form submit doesn't fire
        input.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') {
            var c = input.value.trim();
            if (c) window.location.href = '/estudiantes/' + c + '/';
          }
        });
      }
      // Dark mode button
      var s = document.createElement('style');
      s.textContent = 'html.dark .center{background:#1a1a1a!important;color:#e0e0e0!important}' +
        'html.dark h1{color:#f0f0f0!important}' +
        'html.dark p{color:#ccc!important}' +
        'html.dark input{background:#333!important;color:#e0e0e0!important;border-color:#555!important}' +
        'html.dark input::placeholder{color:#888!important}' +
        'html.dark button[type=submit]{background:#7ba4d4!important}';
      document.head.appendChild(s);
    });
    return; // Don't run the rest of the script on login page
  }

  var selectors = '.left.sidebar,.right.sidebar,.breadcrumb-container,footer.page-footer,.page footer,.graph,.explorer,.search,.meta,time';

  function hideElements() {
    document.querySelectorAll(selectors).forEach(function(el) {
      el.style.display = 'none';
    });
    var qb = document.getElementById('quartz-body');
    if (qb) {
      qb.style.gridTemplate = '"grid-center" 1fr / 1fr';
      qb.style.gap = '0';
      qb.style.padding = '0';
    }
    var article = document.querySelector('article');
    if (article) {
      article.style.maxWidth = '100%';
      article.style.width = '100%';
    }

    // === Navigation buttons ===
    var path = window.location.pathname;
    var match = path.match(/\/estudiantes\/([^/]+)/);
    if (match) {
      var code = match[1];
      var root = '/estudiantes/' + code + '/';

      // Mi Inicio button (house icon)
      if (!document.getElementById('student-home-btn')) {
        var homeBtn = document.createElement('a');
        homeBtn.id = 'student-home-btn';
        homeBtn.href = root;
        homeBtn.innerHTML = '&#127968; Mi Inicio';
        homeBtn.style.cssText = 'position:fixed;top:20px;right:0;z-index:1000;background:#2563eb;color:#fff;padding:10px 18px;border-radius:8px 0 0 8px;text-decoration:none;font-size:15px;font-weight:600;box-shadow:-2px 2px 8px rgba(0,0,0,0.2);transition:background 0.2s;';
        homeBtn.onmouseover = function() { homeBtn.style.background = '#1d4ed8'; };
        homeBtn.onmouseout = function() { homeBtn.style.background = '#2563eb'; };
        document.body.appendChild(homeBtn);
      }

      // Volver button (back arrow) - only if not at student root
      var cleaned = path.replace(/\/+$/, '');
      var segments = cleaned.split('/estudiantes/' + code);
      var subPath = segments[1] || '';
      if (subPath && subPath !== '/' && subPath !== '') {
        if (!document.getElementById('student-back-btn')) {
          var parentPath = subPath.substring(0, subPath.lastIndexOf('/'));
          var backBtn = document.createElement('a');
          backBtn.id = 'student-back-btn';
          backBtn.href = root + parentPath.substring(1) + (parentPath ? '/' : '');
          backBtn.innerHTML = '&#8592; Volver';
          backBtn.style.cssText = 'position:fixed;top:20px;right:160px;z-index:1000;background:#555;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;box-shadow:-2px 2px 8px rgba(0,0,0,0.2);transition:background 0.2s;';
          backBtn.onmouseover = function() { backBtn.style.background = '#777'; };
          backBtn.onmouseout = function() { backBtn.style.background = '#555'; };
          document.body.appendChild(backBtn);
        }
      }
    }

    // === Dark mode button ===
    if (!document.getElementById('student-darkmode-btn')) {
      var dmBtn = document.createElement('button');
      dmBtn.id = 'student-darkmode-btn';
      dmBtn.textContent = '\u263E';
      dmBtn.style.cssText = 'position:fixed;top:20px;right:290px;z-index:1000;background:#333;color:#fff;padding:10px 14px;border:none;border-radius:8px;font-size:18px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.2);transition:background 0.2s;';
      dmBtn.onmouseover = function() { dmBtn.style.setProperty('background', '#555', 'important'); };
      dmBtn.onmouseout = function() { dmBtn.style.setProperty('background', '#333', 'important'); };
      dmBtn.onclick = function() {
        document.documentElement.classList.toggle('dark');
        var isDark = document.documentElement.classList.contains('dark');
        dmBtn.textContent = isDark ? '\u2600' : '\u263E';
        dmBtn.style.setProperty('background', isDark ? '#f0f0f0' : '#333', 'important');
        dmBtn.style.setProperty('color', isDark ? '#333' : '#fff', 'important');
      };
      document.body.appendChild(dmBtn);
    }

    // === Sort button for folder listings ===
    var listing = document.querySelector('.page-listing .section-ul');
    if (listing && !document.getElementById('student-sort-btn')) {
      var sortBtn = document.createElement('button');
      sortBtn.id = 'student-sort-btn';
      sortBtn.innerHTML = '&#8645; A&#8594;Z';
      sortBtn.style.cssText = 'display:inline-block;margin:0.5rem 0;padding:6px 14px;background:#f0f0f0;color:#333;border:1px solid #ccc;border-radius:6px;font-size:14px;cursor:pointer;font-weight:600;transition:background 0.2s;';
      sortBtn.onmouseover = function() { sortBtn.style.background = '#e0e0e0'; };
      sortBtn.onmouseout = function() { sortBtn.style.background = '#f0f0f0'; };

      var sortAsc = true;
      sortBtn.onclick = function() {
        var items = Array.from(listing.querySelectorAll('.section-li'));
        items.sort(function(a, b) {
          var textA = (a.querySelector('a') || {}).textContent || '';
          var textB = (b.querySelector('a') || {}).textContent || '';
          return sortAsc ? textA.localeCompare(textB, void 0, {numeric: true, sensitivity: 'base'}) : textB.localeCompare(textA, void 0, {numeric: true, sensitivity: 'base'});
        });
        items.forEach(function(item) { listing.appendChild(item); });
        sortAsc = !sortAsc;
        sortBtn.innerHTML = sortAsc ? '&#8645; A&#8594;Z' : '&#8645; Z&#8592;A';
      };

      var header = document.querySelector('.page-listing p');
      if (header && header.parentNode) {
        header.parentNode.insertBefore(sortBtn, header.nextSibling);
      }
    }
  }

  // === Styles ===
  function injectStyles() {
    if (document.getElementById('student-table-styles')) return;
    var style = document.createElement('style');
    style.id = 'student-table-styles';
    style.textContent = [
      '*, *::before, *::after { box-sizing: border-box; }',
      'html, body { background: #fff !important; color: #222 !important; margin: 0 !important; padding: 0 !important; width: 100% !important; overflow-x: hidden !important; }',
      '#quartz-body { grid-template: "grid-center" 1fr / 1fr !important; gap: 0 !important; padding: 0 !important; }',
      '.page { max-width: 100% !important; width: 100% !important; padding: 0 2rem !important; }',
      '.page-header, article { background: #fff !important; color: #222 !important; max-width: 100% !important; width: 100% !important; }',
      'article { padding: 0 !important; }',
      '.meta, .meta time, time { display: none !important; }',
      'h1, h2, h3, h4, h5, h6 { color: #111 !important; }',
      'p, li, td, th, span, strong, b { color: #222 !important; }',
      'a { color: #2563eb !important; }',
      'a:hover { color: #1d4ed8 !important; }',
      '.popover, .popover .popover-inner { background-color: #fff !important; color: #222 !important; border-color: #ccc !important; box-shadow: 6px 6px 36px rgba(0,0,0,0.15) !important; }',
      '.popover h1, .popover h2, .popover h3, .popover p, .popover span, .popover li { color: #222 !important; }',
      '.popover a { color: #2563eb !important; }',
      '#student-home-btn, #student-back-btn { color: #fff !important; }',
      '#student-darkmode-btn { background: #333 !important; color: #fff !important; border: none !important; }',
      '#student-sort-btn { background: #f0f0f0 !important; color: #333 !important; border: 1px solid #ccc !important; }',
      'table { width: 100% !important; border-collapse: collapse; margin: 1em 0; font-size: 16px; }',
      'th, td { border: 1px solid #ccc; padding: 10px 14px; text-align: left; }',
      'th { background: #f0f0f0; font-weight: 600; color: #222 !important; }',
      'tr:nth-child(even) { background: #f5f5f5 !important; }',
      'tr:nth-child(odd) { background: #fff !important; }',
      'tr:hover { background: #e8f0fe !important; }',
      'hr { border-color: #ddd !important; }',
      'code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; color: #333 !important; }',
      'pre { background: #f4f4f4; padding: 12px; border-radius: 6px; overflow-x: auto; }',
      '',
      'html.dark { background: #1a1a1a !important; color: #e0e0e0 !important; }',
      'html.dark body { background: #1a1a1a !important; color: #e0e0e0 !important; }',
      'html.dark #quartz-body { background: #1a1a1a !important; }',
      'html.dark .page, html.dark .page-header, html.dark article { background: #1a1a1a !important; color: #e0e0e0 !important; max-width: 100% !important; width: 100% !important; }',
      'html.dark h1, html.dark h2, html.dark h3, html.dark h4, html.dark h5, html.dark h6 { color: #f0f0f0 !important; }',
      'html.dark p, html.dark li, html.dark td, html.dark th, html.dark span, html.dark strong, html.dark b { color: #e0e0e0 !important; }',
      'html.dark a { color: #7ba4d4 !important; }',
      'html.dark #student-home-btn, html.dark #student-back-btn, html.dark #student-home-btn span { color: #fff !important; }',
      'html.dark #student-darkmode-btn { background: #f0f0f0 !important; color: #333 !important; border: none !important; }',
      'html.dark #student-sort-btn { background: #333 !important; color: #e0e0e0 !important; border-color: #555 !important; }',
      'html.dark a:hover { color: #a0c4f0 !important; }',
      'html.dark th { background: #333 !important; color: #e0e0e0 !important; }',
      'html.dark tr:nth-child(even) { background: #2a2a2a !important; }',
      'html.dark tr:nth-child(odd) { background: #222 !important; }',
      'html.dark tr:hover { background: #3a3a4a !important; }',
      'html.dark th, html.dark td { border-color: #555 !important; }',
      'html.dark hr { border-color: #555 !important; }',
      'html.dark code { background: #333; color: #e0e0e0 !important; }',
      'html.dark pre { background: #2a2a2a; }',
      'html.dark .popover, html.dark .popover .popover-inner { background-color: #2a2a2a !important; color: #e0e0e0 !important; border-color: #555 !important; }',
      'html.dark .popover h1, html.dark .popover h2, html.dark .popover h3, html.dark .popover p, html.dark .popover span, html.dark .popover li { color: #e0e0e0 !important; }',
      'html.dark .popover a { color: #7ba4d4 !important; }',
      '',
      '@media (max-width: 768px) {',
      '  .page { padding: 1rem !important; }',
      '  table { font-size: 13px; }',
      '  th, td { padding: 6px 8px; }',
      '  #student-home-btn { top: 10px !important; right: 0 !important; font-size: 14px !important; padding: 8px 14px !important; }',
      '  #student-back-btn { top: 10px !important; right: 110px !important; font-size: 14px !important; padding: 8px 14px !important; }',
      '  #student-darkmode-btn { top: 10px !important; right: 200px !important; font-size: 16px !important; padding: 8px 10px !important; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  injectStyles();
  hideElements();
  var observer = new MutationObserver(hideElements);
  observer.observe(document.body, { childList: true, subtree: true });
})();
