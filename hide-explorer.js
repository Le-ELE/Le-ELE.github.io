// Hide Explorer, Search, and Graph on student pages + Home button
(function() {
  function hideElements() {
    // Hide left sidebar (Explorer + Search)
    var leftSidebar = document.querySelector('.left.sidebar');
    if (leftSidebar) leftSidebar.style.display = 'none';

    // Hide right sidebar (Graph)
    var rightSidebar = document.querySelector('.right.sidebar');
    if (rightSidebar) rightSidebar.style.display = 'none';

    // Hide breadcrumb
    var breadcrumb = document.querySelector('.breadcrumb-container');
    if (breadcrumb) breadcrumb.style.display = 'none';

    // Make center content full width
    var center = document.querySelector('.center');
    if (center) {
      center.style.marginLeft = '0';
      center.style.maxWidth = '100%';
    }

    // Add Home button if not already added
    if (!document.getElementById('student-home-btn')) {
      var path = window.location.pathname;
      var match = path.match(/\/estudiantes\/([^/]+)/);
      if (match) {
        var btn = document.createElement('a');
        btn.id = 'student-home-btn';
        btn.href = '/estudiantes/' + match[1] + '/';
        btn.textContent = '\u2190 Mi Inicio';
        btn.style.cssText = 'position:fixed;top:70px;left:0;z-index:1000;background:#2563eb;color:#fff;padding:10px 20px;border-radius:0 8px 8px 0;text-decoration:none;font-size:16px;font-weight:600;box-shadow:2px 2px 8px rgba(0,0,0,0.2);transition:background 0.2s;';
        btn.onmouseover = function() { btn.style.background = '#1d4ed8'; };
        btn.onmouseout = function() { btn.style.background = '#2563eb'; };
        document.body.appendChild(btn);
      }
    }

    // Add table styles if not already added
    if (!document.getElementById('student-table-styles')) {
      var style = document.createElement('style');
      style.id = 'student-table-styles';
      style.textContent = 'table{width:100%;border-collapse:collapse;margin:1em 0;font-size:14px}th,td{border:1px solid #ccc;padding:8px 12px;text-align:left}th{background:#f0f0f0;font-weight:600}tr:nth-child(even){background:#f9f9f9}tr:nth-child(odd){background:#fff}tr:hover{background:#eef2ff}';
      document.head.appendChild(style);
    }
  }
  hideElements();
  setTimeout(hideElements, 500);
  setTimeout(hideElements, 1000);
})();
