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
        btn.style.cssText = 'position:fixed;top:20px;left:20px;z-index:1000;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,0.2);transition:background 0.2s;';
        btn.onmouseover = function() { btn.style.background = '#1d4ed8'; };
        btn.onmouseout = function() { btn.style.background = '#2563eb'; };
        document.body.appendChild(btn);
      }
    }
  }
  hideElements();
  setTimeout(hideElements, 500);
  setTimeout(hideElements, 1000);
})();
