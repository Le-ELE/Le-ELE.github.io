(function() {
  var selectors = '.left.sidebar,.right.sidebar,.breadcrumb-container,footer.page-footer,.page footer,.graph,.explorer,.search';

  function hideElements() {
    document.querySelectorAll(selectors).forEach(function(el) {
      el.style.display = 'none';
    });
    var center = document.querySelector('.center');
    if (center) {
      center.style.marginLeft = '0';
      center.style.maxWidth = '100%';
      center.style.width = '100%';
    }
    var page = document.querySelector('.page');
    if (page) {
      page.style.maxWidth = '100%';
      page.style.width = '100%';
      page.style.margin = '0';
      page.style.padding = '1.5rem';
      page.style.overflow = 'hidden';
    }
    if (!document.getElementById('student-home-btn')) {
      var path = window.location.pathname;
      var match = path.match(/\/estudiantes\/([^/]+)/);
      if (match) {
        var btn = document.createElement('a');
        btn.id = 'student-home-btn';
        btn.href = '/estudiantes/' + match[1] + '/';
        btn.textContent = '\u2190 Mi Inicio';
        btn.style.cssText = 'position:fixed;top:20px;right:0;z-index:1000;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px 0 0 8px;text-decoration:none;font-size:16px;font-weight:600;box-shadow:-2px 2px 8px rgba(0,0,0,0.2);transition:background 0.2s;';
        btn.onmouseover = function() { btn.style.background = '#1d4ed8'; };
        btn.onmouseout = function() { btn.style.background = '#2563eb'; };
        document.body.appendChild(btn);
      }
    }
    if (!document.getElementById('student-darkmode-btn')) {
      var dmBtn = document.createElement('button');
      dmBtn.id = 'student-darkmode-btn';
      dmBtn.textContent = '\u263E';
      dmBtn.style.cssText = 'position:fixed;top:20px;right:140px;z-index:1000;background:#333;color:#fff;padding:10px 14px;border:none;border-radius:8px;font-size:18px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.2);transition:background 0.2s;';
      dmBtn.onmouseover = function() { dmBtn.style.background = '#555'; };
      dmBtn.onmouseout = function() { dmBtn.style.background = '#333'; };
      dmBtn.onclick = function() {
        document.documentElement.classList.toggle('dark');
        var isDark = document.documentElement.classList.contains('dark');
        dmBtn.textContent = isDark ? '\u2600' : '\u263E';
        dmBtn.style.background = isDark ? '#f0f0f0' : '#333';
        dmBtn.style.color = isDark ? '#333' : '#fff';
      };
      document.body.appendChild(dmBtn);
    }
    if (!document.getElementById('student-table-styles')) {
      var style = document.createElement('style');
      style.id = 'student-table-styles';
      style.textContent = [
        '*, *::before, *::after { box-sizing: border-box; }',
        'html, body { background: #fff !important; color: #222 !important; margin: 0 !important; padding: 0 !important; width: 100% !important; overflow-x: hidden !important; }',
        '.page, .page-header, article { background: #fff !important; color: #222 !important; }',
        'h1, h2, h3, h4, h5, h6 { color: #111 !important; }',
        'p, li, td, th, span, strong, b { color: #222 !important; }',
        'a { color: #2563eb !important; }',
        '#student-home-btn, #student-home-btn span { color: #fff !important; }',
        '#student-darkmode-btn { background: #333 !important; color: #fff !important; border: none !important; }',
        'a:hover { color: #1d4ed8 !important; }',
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
        'html.dark .page, html.dark .page-header, html.dark article { background: #1a1a1a !important; color: #e0e0e0 !important; }',
        'html.dark h1, html.dark h2, html.dark h3, html.dark h4, html.dark h5, html.dark h6 { color: #f0f0f0 !important; }',
        'html.dark p, html.dark li, html.dark td, html.dark th, html.dark span, html.dark strong, html.dark b { color: #e0e0e0 !important; }',
        'html.dark a { color: #7ba4d4 !important; }',
        'html.dark #student-home-btn, html.dark #student-home-btn span { color: #fff !important; }',
        'html.dark #student-darkmode-btn { background: #f0f0f0 !important; color: #333 !important; border: none !important; }',
        'html.dark a:hover { color: #a0c4f0 !important; }',
        'html.dark th { background: #333 !important; color: #e0e0e0 !important; }',
        'html.dark tr:nth-child(even) { background: #2a2a2a !important; }',
        'html.dark tr:nth-child(odd) { background: #222 !important; }',
        'html.dark tr:hover { background: #3a3a4a !important; }',
        'html.dark th, html.dark td { border-color: #555 !important; }',
        'html.dark hr { border-color: #555 !important; }',
        'html.dark code { background: #333; color: #e0e0e0 !important; }',
        'html.dark pre { background: #2a2a2a; }',
        '',
        '@media (max-width: 768px) {',
        '  .page { padding: 1rem !important; }',
        '  table { font-size: 13px; }',
        '  th, td { padding: 6px 8px; }',
        '  #student-home-btn { top: 10px !important; right: 0 !important; font-size: 14px !important; padding: 8px 14px !important; }',
        '  #student-darkmode-btn { top: 10px !important; right: 110px !important; font-size: 16px !important; padding: 8px 10px !important; }',
        '}'
      ].join('\n');
      document.head.appendChild(style);
    }
  }

  hideElements();
  var observer = new MutationObserver(hideElements);
  observer.observe(document.body, { childList: true, subtree: true });
})();
