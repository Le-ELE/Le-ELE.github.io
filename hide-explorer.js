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
    }
    if (!document.getElementById('student-home-btn')) {
      var path = window.location.pathname;
      var match = path.match(/\/estudiantes\/([^/]+)/);
      if (match) {
        var btn = document.createElement('a');
        btn.id = 'student-home-btn';
        btn.href = '/estudiantes/' + match[1] + '/';
        btn.textContent = '\u2190 Mi Inicio';
        btn.style.cssText = 'position:fixed;top:70px;right:0;z-index:1000;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px 0 0 8px;text-decoration:none;font-size:16px;font-weight:600;box-shadow:-2px 2px 8px rgba(0,0,0,0.2);transition:background 0.2s;';
        btn.onmouseover = function() { btn.style.background = '#1d4ed8'; };
        btn.onmouseout = function() { btn.style.background = '#2563eb'; };
        document.body.appendChild(btn);
      }
    }
    if (!document.getElementById('student-table-styles')) {
      var style = document.createElement('style');
      style.id = 'student-table-styles';
      style.textContent = 'table{width:100%;border-collapse:collapse;margin:1em 0;font-size:14px}th,td{border:1px solid #ccc;padding:8px 12px;text-align:left}th{background:#f0f0f0;font-weight:600}tr:nth-child(even){background:#f9f9f9}tr:nth-child(odd){background:#fff}tr:hover{background:#eef2ff}';
      document.head.appendChild(style);
    }
  }

  hideElements();
  var observer = new MutationObserver(hideElements);
  observer.observe(document.body, { childList: true, subtree: true });
})();
