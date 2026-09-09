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
          '<h1 style="font-size:2rem;margin-bottom:0.5rem">Estudiantes</h1>' +
          '<p style="margin-bottom:1.5rem;font-size:16px">Ingresa tu código de estudiante para acceder a tus notas.</p>' +
          '<form id="login-form" style="display:flex;flex-direction:column;gap:12px">' +
          '<input id="login-input" type="text" placeholder="Ej: Santiago-ie349t" autocomplete="off" style="padding:14px 16px;font-size:16px;border:2px solid #ddd;border-radius:8px;outline:none;transition:border-color 0.2s;width:100%;box-sizing:border-box" />' +
          '<button type="submit" style="padding:14px;font-size:16px;background:#2563eb;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;transition:background 0.2s">Entrar</button>' +
          '</form>' +
          '<p id="login-error" style="color:#e53e3e;margin-top:12px;font-size:14px;display:none">Ese código no existe. Intenta de nuevo.</p>' +
          '</div></div>';

        var validCodes = ['Leo-jxbun0','Rebecca-u1e74p','Rheis-kggbu0','Santiago-ie349t'];
        var form = document.getElementById('login-form');
        var input = document.getElementById('login-input');
        var error = document.getElementById('login-error');

        form.onsubmit = function(e) {
          e.preventDefault();
          var code = input.value.trim();
          if (!code) return;
          if (validCodes.indexOf(code) !== -1) {
            window.location.href = '/estudiantes/' + code + '/';
          } else {
            error.style.display = 'block';
            input.value = '';
            input.focus();
          }
        };
        input.focus();
      }

      // Dark mode toggle button
      var dmBtn = document.createElement('button');
      dmBtn.id = 'login-darkmode-btn';
      dmBtn.textContent = '\u263E';
      dmBtn.style.cssText = 'position:fixed;top:20px;right:20px;z-index:1000;background:#333;color:#fff;padding:10px 14px;border:none;border-radius:8px;font-size:18px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.2);transition:background 0.2s;';
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
    });
    return;
  }

  // === Student pages ===
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
    var navPath = window.location.pathname;
    var match = navPath.match(/\/estudiantes\/([^/]+)/);
    if (match) {
      var code = match[1];
      var root = '/estudiantes/' + code + '/';

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

      var cleaned = navPath.replace(/\/+$/, '');
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
      sortBtn.style.cssText = 'display:block;margin:0.5rem 0;padding:6px 14px;background:#f0f0f0;color:#333;border:1px solid #ccc;border-radius:6px;font-size:14px;cursor:pointer;font-weight:600;transition:background 0.2s;width:fit-content;';
      sortBtn.onmouseover = function() { sortBtn.style.setProperty('background', '#e0e0e0', 'important'); };
      sortBtn.onmouseout = function() { sortBtn.style.setProperty('background', '#f0f0f0', 'important'); };

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
      var pageListing = document.querySelector('.page-listing');
      if (header && header.parentNode) {
        header.parentNode.insertBefore(sortBtn, header.nextSibling);
      } else if (pageListing) {
        pageListing.insertBefore(sortBtn, pageListing.firstChild);
      }
    }
  }

  hideElements();
  var observer = new MutationObserver(hideElements);
  observer.observe(document.body, { childList: true, subtree: true });
})();
