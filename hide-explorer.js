(function() {
  var path = window.location.pathname.replace(/\/+$/, '');
  var isLoginRoot = path === '/estudiantes' || path === '/estudiantes/';

  // === Restore dark mode from localStorage ===
  if (localStorage.getItem('leele-dark') === 'true') {
    document.documentElement.classList.add('dark');
  }

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
          '<p style="margin-bottom:1.5rem;font-size:16px">Escribe el nombre de tu carpeta para entrar a tus notas.</p>' +
          '<form id="login-form" style="display:flex;flex-direction:column;gap:12px">' +
          '<input id="login-input" type="text" placeholder="Ej: Santiago-ie349t" autocomplete="off" style="padding:14px 16px;font-size:16px;border:2px solid #ddd;border-radius:8px;outline:none;transition:border-color 0.2s;width:100%;box-sizing:border-box" />' +
          '<button type="submit" style="padding:14px;font-size:16px;background:#2563eb;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;transition:background 0.2s">Buscar</button>' +
          '</form>' +
          '<p id="login-error" style="color:#e53e3e;margin-top:12px;font-size:14px;display:none">Ese código no existe. Intenta de nuevo.</p>' +
          '</div></div>';

        var form = document.getElementById('login-form');
        var input = document.getElementById('login-input');
        var error = document.getElementById('login-error');

        form.onsubmit = function(e) {
          e.preventDefault();
          var code = input.value.trim();
          if (!code) return;
          if (code.indexOf('/') !== -1) {
            error.textContent = 'Solo puedes buscar carpetas del primer nivel.';
            error.style.display = 'block';
            input.focus();
            return;
          }
          var target = '/estudiantes/' + encodeURIComponent(code) + '/';
          var btn = form.querySelector('button[type=submit]');
          var original = btn.textContent;
          btn.textContent = 'Buscando…';
          btn.style.opacity = '0.7';
          fetch(target, { method: 'GET' }).then(function(res) {
            if (res.ok) {
              window.location.href = target;
            } else {
              btn.textContent = original;
              btn.style.opacity = '1';
              error.textContent = 'Ese código no existe. Intenta de nuevo.';
              error.style.display = 'block';
              input.value = '';
              input.focus();
            }
          })['catch'](function() {
            btn.textContent = original;
            btn.style.opacity = '1';
            error.textContent = 'Ese código no existe. Intenta de nuevo.';
            error.style.display = 'block';
            input.value = '';
            input.focus();
          });
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
        localStorage.setItem('leele-dark', isDark);
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

  // === Progress bar for class packages (task lists like "- [ ] 1") ===
  function addPackageBars() {
    var article = document.querySelector('article');
    if (!article) return;
    if (article.textContent.indexOf('Paquete') === -1) return;
    article.querySelectorAll('ul.contains-task-list').forEach(function(list) {
      var prev = list.previousElementSibling;
      if (prev && prev.classList && prev.classList.contains('package-progress')) return;
      var boxes = list.querySelectorAll('input[type=checkbox]');
      if (!boxes.length) return;
      var total = boxes.length;
      var seen = 0;
      boxes.forEach(function(b) { if (b.checked) seen++; });
      var pct = Math.round(seen / total * 100);
      var remaining = total - seen;
      var pluralSeen = seen === 1 ? '1 clase' : seen + ' clases';
      var pluralRemain = remaining === 1 ? 'te queda 1' : 'te quedan ' + remaining;
      var bar = document.createElement('div');
      bar.className = 'package-progress';
      var track = document.createElement('div');
      track.className = 'package-track';
      var fill = document.createElement('div');
      fill.className = 'package-fill';
      fill.style.width = pct + '%';
      track.appendChild(fill);
      var text = document.createElement('p');
      text.className = 'package-text';
      text.textContent = 'Has visto ' + pluralSeen + ', ' + pluralRemain;
      bar.appendChild(track);
      bar.appendChild(text);
      list.parentNode.insertBefore(bar, list);
    });
  }

  // === Collapsible headings (like Obsidian folds) ===
  var foldKey = 'leele-folds:' + window.location.pathname;

  function headingLevel(el) {
    var t = el.tagName;
    return t[1] ? parseInt(t[1]) : 0;
  }

  function sectionRange(heading) {
    var level = headingLevel(heading);
    var range = [];
    var n = heading.nextElementSibling;
    while (n) {
      if (/^H[1-6]$/.test(n.tagName) && headingLevel(n) <= level) break;
      range.push(n);
      n = n.nextElementSibling;
    }
    return range;
  }

  function saveFolds() {
    var ids = [];
    document.querySelectorAll('article h1.is-collapsed,article h2.is-collapsed,article h3.is-collapsed,article h4.is-collapsed,article h5.is-collapsed,article h6.is-collapsed').forEach(function(h) {
      if (h.id) ids.push(h.id);
    });
    try { localStorage.setItem(foldKey, JSON.stringify(ids)); } catch (e) {}
  }

  function enableFoldableHeadings() {
    var article = document.querySelector('article');
    if (!article) return;

    // Mark headings as foldable if they have content below them
    article.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(function(h) {
      var first = h.nextElementSibling;
      var hasContent = !!(first && !(/^H[1-6]$/.test(first.tagName) && headingLevel(first) <= headingLevel(h)));
      h.classList.toggle('is-foldable', hasContent);
    });

    // Restore saved collapsed state
    var saved = [];
    try { saved = JSON.parse(localStorage.getItem(foldKey) || '[]'); } catch (e) { saved = []; }
    saved.forEach(function(id) {
      var h = article.querySelector('#' + id);
      if (h && h.classList.contains('is-foldable') && !h.classList.contains('is-collapsed')) {
        h.classList.add('is-collapsed');
        sectionRange(h).forEach(function(el) { el.classList.add('is-folded'); });
      }
    });

    if (article.dataset.foldBound) return;
    article.dataset.foldBound = '1';
    article.addEventListener('click', function(e) {
      var target = e.target;
      if (target.closest && target.closest('a')) return;
      var heading = target.closest ? target.closest('h1,h2,h3,h4,h5,h6') : null;
      if (!heading || !heading.classList.contains('is-foldable')) return;
      var collapsed = heading.classList.toggle('is-collapsed');
      sectionRange(heading).forEach(function(el) {
        el.classList.toggle('is-folded', collapsed);
      });
      saveFolds();
    });
  }

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

      // LéELE button (link to main site)
      if (!document.getElementById('student-elle-btn')) {
        var elleBtn = document.createElement('a');
        elleBtn.id = 'student-elle-btn';
        elleBtn.href = '/';
        elleBtn.innerHTML = '&#128214; LéELE';
        elleBtn.style.cssText = 'position:fixed;top:20px;left:0;z-index:1000;background:#8B4513;color:#fff;padding:10px 18px;border-radius:0 8px 8px 0;text-decoration:none;font-size:15px;font-weight:600;box-shadow:2px 2px 8px rgba(0,0,0,0.2);transition:background 0.2s;';
        elleBtn.onmouseover = function() { elleBtn.style.background = '#A0522D'; };
        elleBtn.onmouseout = function() { elleBtn.style.background = '#8B4513'; };
        elleBtn.onclick = function() { document.documentElement.classList.remove('dark'); };
        document.body.appendChild(elleBtn);
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
        localStorage.setItem('leele-dark', isDark);
        dmBtn.textContent = isDark ? '\u2600' : '\u263E';
        dmBtn.style.setProperty('background', isDark ? '#f0f0f0' : '#333', 'important');
        dmBtn.style.setProperty('color', isDark ? '#333' : '#fff', 'important');
      };
      document.body.appendChild(dmBtn);
    }

    addPackageBars();
    enableFoldableHeadings();

  }

  hideElements();
  var observer = new MutationObserver(hideElements);
  observer.observe(document.body, { childList: true, subtree: true });
})();
