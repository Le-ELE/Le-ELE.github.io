(function() {
  var path = window.location.pathname.replace(/\/+$/, '');
  var isLoginRoot = path === '/estudiantes' || path === '/estudiantes/';

  // === Iconos SVG de navegación ===
  var ICONS = {
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    house: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>',
    moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
    download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>'
  };

  // === Restaurar modo oscuro desde localStorage ===
  if (localStorage.getItem('leele-dark') === 'true') {
    document.documentElement.classList.add('dark');
  }

  // === Aplicar ícono de sol/luna a un botón de modo oscuro ===
  function setDarkIcon(btn, isDark) {
    var ico = btn.querySelector('.nav-ico') || btn;
    ico.innerHTML = isDark ? ICONS.sun : ICONS.moon;
  }

  function initDarkToggle(btn, onToggle) {
    btn.setAttribute('aria-label', 'Cambiar modo oscuro');
    btn.innerHTML = '<span class="nav-ico"></span>';
    setDarkIcon(btn, document.documentElement.classList.contains('dark'));
    btn.addEventListener('click', function() {
      var isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('leele-dark', isDark);
      setDarkIcon(btn, isDark);
      if (onToggle) onToggle(isDark);
    });
  }

  // === Login page para /estudiantes/ ===
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
        center.innerHTML =
          '<div class="login-wrap">' +
            '<div class="login-card">' +
              '<img class="login-logo" src="/imagenes/logo_pequeño.png" alt="Logo de LéELE">' +
              '<h1 class="login-title">Estudiantes</h1>' +
              '<p class="login-sub">Escribe el nombre de tu carpeta para entrar a tus notas.</p>' +
              '<form id="login-form" class="login-form">' +
                '<div class="login-field">' +
                  '<input id="login-input" class="login-input" type="text" placeholder="Ej: Santiago" autocomplete="off">' +
                '</div>' +
                '<button type="submit" class="login-btn">Buscar</button>' +
              '</form>' +
              '<p id="login-error" class="login-error">Ese código no existe. Intenta de nuevo.</p>' +
            '</div>' +
          '</div>';

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
          btn.classList.add('is-loading');
          btn.textContent = 'Buscando…';
          fetch(target, { method: 'GET' }).then(function(res) {
            if (res.ok) {
              window.location.href = target;
            } else {
              btn.classList.remove('is-loading');
              btn.textContent = original;
              error.textContent = 'Ese código no existe. Intenta de nuevo.';
              error.style.display = 'block';
              input.value = '';
              input.focus();
            }
          })['catch'](function() {
            btn.classList.remove('is-loading');
            btn.textContent = original;
            error.textContent = 'Ese código no existe. Intenta de nuevo.';
            error.style.display = 'block';
            input.value = '';
            input.focus();
          });
        };
        input.focus();
      }

      // Botón de modo oscuro (circular, arriba a la derecha)
      var dmBtn = document.createElement('button');
      dmBtn.id = 'login-darkmode-btn';
      dmBtn.className = 'leele-dm';
      initDarkToggle(dmBtn);
      document.body.appendChild(dmBtn);
    });
    return;
  }

  // === Páginas de estudiantes ===
  var selectors = '.left.sidebar,.right.sidebar,.breadcrumb-container,footer.page-footer,.page footer,.graph,.explorer,.search,.meta,time';

  // === Barra de progreso para paquetes de clases (listas de tareas) ===
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

  // === Títulos plegables (tipo Obsidian) ===
  function getFoldKey() { return 'leele-folds:' + window.location.pathname; }

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
    try { localStorage.setItem(getFoldKey(), JSON.stringify(ids)); } catch (e) {}
  }

  function enableFoldableHeadings() {
    var article = document.querySelector('article');
    if (!article) return;

    article.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(function(h) {
      var first = h.nextElementSibling;
      var hasContent = !!(first && !(/^H[1-6]$/.test(first.tagName) && headingLevel(first) <= headingLevel(h)));
      h.classList.toggle('is-foldable', hasContent);
    });

    var saved = [];
    try { saved = JSON.parse(localStorage.getItem(getFoldKey()) || '[]'); } catch (e) { saved = []; }
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

  // === Saludo de bienvenida (carpetas principales de estudiantes) ===
  function addHeroGreeting() {
    if (document.getElementById('leele-hero')) return;
    var heroPath = window.location.pathname.replace(/\/+$/, '');
    var match = heroPath.match(/^\/estudiantes\/([^/]+)$/);
    if (!match) return;
    var folderName = decodeURIComponent(match[1]);
    var parts = folderName.match(/^(.+)-([a-zA-Z0-9]+)$/);
    if (!parts) return;
    var code = parts[2];
    if (code.length < 5 || !/[0-9]/.test(code)) return;
    var name = parts[1];

    document.title = 'LéELE: ' + name;
    var og = document.querySelector('meta[property="og:title"]');
    if (og) og.setAttribute('content', 'LéELE: ' + name);
    var tw = document.querySelector('meta[name="twitter:title"]');
    if (tw) tw.setAttribute('content', 'LéELE: ' + name);

    var holder = document.querySelector('.page-header .popover-hint');
    if (!holder) return;
    var wrap = document.createElement('div');
    wrap.id = 'leele-hero';
    wrap.className = 'leele-hero';
    var logo = document.createElement('img');
    logo.className = 'leele-hero-logo';
    logo.src = '/imagenes/logo_grande.png';
    logo.alt = 'Logo de LéELE';
    var titleEl = document.createElement('h1');
    titleEl.className = 'leele-hero-title';
    titleEl.textContent = 'Hola, ' + name + '!';
    wrap.appendChild(logo);
    wrap.appendChild(titleEl);
    holder.innerHTML = '';
    holder.appendChild(wrap);
  }

  // === Botón de descarga del mazo de Anki ===
  // Solo aparece en la pagina /estudiantes/<código>/Anki.html, que es donde
  // vive la tabla del mazo. El .apkg se genera en el build
  // (site/anki_build.py) junto a esa pagina, asi que la URL se deduce del
  // path quitando la extensión.
  function addAnkiDownload() {
    if (document.getElementById('leele-anki')) return;

    var match = window.location.pathname.match(/^\/estudiantes\/([^/]+)\/Anki(?:\.html)?\/?$/);
    if (!match) return;

    var code = match[1];
    var url = '/estudiantes/' + code + '/Anki.apkg';

    var box = document.createElement('div');
    box.id = 'leele-anki';
    box.className = 'leele-anki';

    var link = document.createElement('a');
    link.className = 'leele-anki-btn';
    link.href = url;
    link.setAttribute('download', 'Anki.apkg');
    link.innerHTML = '<span class="leele-anki-ico">' + ICONS.download + '</span>' +
                     '<span class="leele-anki-label">Descargar el mazo</span>' +
                     '<span class="leele-anki-ext">.apkg</span>';

    var help = document.createElement('p');
    help.className = 'leele-anki-help';
    help.textContent = 'Descárgalo y ábrelo con Anki para importar las tarjetas. ' +
                       'Cuando lo vuelvas a descargar e importar, se actualizan las que cambiaron ' +
                       'y se conserva lo que ya repasaste. Puedes dejar las opciones de importación ' +
                       'tal cual: el mazo usa tus propios ajustes y no modifica nada tuyo.';

    box.appendChild(link);
    box.appendChild(help);

    var article = document.querySelector('article');
    if (article) {
      article.insertBefore(box, article.firstChild);
    } else {
      var holder = document.querySelector('.page-header .popover-hint');
      if (holder) holder.appendChild(box);
    }

    configurarMazo(code, box, link, help);
  }

  // === Estado del mazo: sin tarjetas, al dia o desfasado ===
  // El build escribe <Estudiante>/Anki.json con cuantas tarjetas lleva el
  // .apkg y una version unica de ese build. Se pide con cache: no-store y
  // segun lo que traiga:
  //
  //   - 0 tarjetas: el estudiante es nuevo (o es la plantilla) y todavia no
  //     hay material. Se oculta el boton, que si no descargaria un 404.
  //   - notas == filas de la tabla: todo al dia. La version se pega como ?v=
  //     a la URL del .apkg para saltar el cache de GitHub Pages
  //     (cache-control: max-age=600), que si no sirve un archivo viejo hasta
  //     10 minutos.
  //   - notas != filas: el .apkg todavia no incluye lo ultimo (el navegador
  //     tiene el HTML nuevo pero el archivo cacheado). Se avisa que espere en
  //     vez de dejar que importe algo incompleto creyendo que la carga fallo.
  function contarFilasMazo() {
    // La tabla del mazo: 3 columnas (espanol / ingles / nota). Se ignoran las
    // filas de cabecera y separador, que Quartz ya renderizo como th.
    var filas = document.querySelectorAll(
      'article table tbody tr'
    );
    var total = 0;
    for (var i = 0; i < filas.length; i++) {
      var celdas = filas[i].querySelectorAll('td');
      // Una fila con las tres columnas vacias no es una tarjeta (el parser de
      // Python tambien las salta), asi que no cuenta.
      var tieneAlgo = false;
      for (var j = 0; j < celdas.length; j++) {
        if ((celdas[j].textContent || '').trim()) { tieneAlgo = true; break; }
      }
      if (tieneAlgo) total++;
    }
    return total;
  }

  function configurarMazo(code, box, link, help) {
    var enPagina = contarFilasMazo();

    fetch('/estudiantes/' + code + '/Anki.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        // Sin manifest no deberia pasar (todos los Anki.md lo generan). Si
        // pasa, se deja el boton como esta antes que romper la pagina.
        if (!data || typeof data.notas !== 'number') return;

        if (data.notas === 0) {
          link.style.display = 'none';
          help.textContent = 'Este mazo todavía no tiene tarjetas. ' +
                             'Aparecerán aquí en cuanto se añada material.';
          return;
        }

        // Version del build actual: unica por despliegue, fuerza la descarga
        // nueva saltando el cache de GitHub Pages.
        if (data.version != null) {
          link.href = link.href + '?v=' + encodeURIComponent(data.version);
        }

        if (data.notas === enPagina) return;  // todo al dia

        var aviso = document.createElement('p');
        aviso.className = 'leele-anki-stale';
        aviso.textContent =
          'Tu mazo se está generando. Esta página ya muestra ' + enPagina +
          ' tarjetas, pero el archivo que se descarga todavía tiene ' +
          data.notas + '. Espera unos minutos y recarga la página para ' +
          'descargarlo con todo el contenido.';
        box.appendChild(aviso);
      })
      .catch(function () { /* sin manifest: el boton sigue funcionando */ });
  }

  // === Título de carpetas: solo el último segmento ===
  function fixFolderTitles() {
    var titleEl = document.querySelector('.page-header .article-title');
    if (!titleEl || (titleEl.textContent || '').indexOf('Carpeta: ') !== 0) return;
    var clean = titleEl.textContent.substring('Carpeta: '.length);
    var parts = clean.split('/');
    var last = parts[parts.length - 1];
    if (!last) return;
    if (titleEl.dataset.leeleFolderTitle !== last) {
      titleEl.textContent = last;
      titleEl.dataset.leeleFolderTitle = last;
    }
    document.title = last;
    var og = document.querySelector('meta[property="og:title"]');
    if (og) og.setAttribute('content', last);
    var tw = document.querySelector('meta[name="twitter:title"]');
    if (tw) tw.setAttribute('content', last);
  }

  // === Envolver el texto de las tarjetas para que encierre dentro de la caja ===
  function wrapSectionTitles() {
    document.querySelectorAll('.section .desc h3 a').forEach(function(a) {
      if (a.querySelector('.section-title')) return;
      var nodes = [];
      a.childNodes.forEach(function(n) {
        if (n.nodeType === 3 && n.textContent.trim()) nodes.push(n);
      });
      if (!nodes.length) return;
      var span = document.createElement('span');
      span.className = 'section-title';
      nodes.forEach(function(n) { span.appendChild(n); });
      a.appendChild(span);
    });
  }

  // === Barra de navegación unificada ===
  function buildNav() {
    var navPath = window.location.pathname;
    var match = navPath.match(/\/estudiantes\/([^/]+)/);
    if (!match) return;
    var code = match[1];
    var root = '/estudiantes/' + code + '/';

    var nav = document.createElement('nav');
    nav.id = 'leele-nav';
    nav.className = 'leele-nav';
    nav.setAttribute('aria-label', 'Navegación');

    // LéELE (enlace al sitio principal)
    var brand = document.createElement('a');
    brand.className = 'nav-pill nav-pill-brand';
    brand.href = '/';
    brand.innerHTML = '<span class="nav-ico nav-ico-brand"><img src="/imagenes/logo_favicon.png" alt="LéELE"></span>';
    brand.addEventListener('click', function() { document.documentElement.classList.remove('dark'); });
    nav.appendChild(brand);

    nav.appendChild(sep());

    // Volver (si estamos dentro de una subcarpeta)
    var cleaned = navPath.replace(/\/+$/, '');
    var segments = cleaned.split('/estudiantes/' + code);
    var subPath = segments[1] || '';
    if (subPath && subPath !== '/' && subPath !== '') {
      var parentPath = subPath.substring(0, subPath.lastIndexOf('/'));
      var backBtn = document.createElement('a');
      backBtn.id = 'student-back-btn';
      backBtn.className = 'nav-pill';
      backBtn.href = root + parentPath.substring(1) + (parentPath ? '/' : '');
      backBtn.innerHTML = '<span class="nav-ico">' + ICONS.back + '</span><span class="nav-label">Volver</span>';
      nav.appendChild(backBtn);
    }

    // Mi Inicio
    var home = document.createElement('a');
    home.id = 'student-home-btn';
    home.className = 'nav-pill';
    home.href = root;
    home.innerHTML = '<span class="nav-ico">' + ICONS.house + '</span><span class="nav-label">Mi Inicio</span>';
    nav.appendChild(home);

    nav.appendChild(sep());

    // Modo oscuro
    var dmBtn = document.createElement('button');
    dmBtn.id = 'student-darkmode-btn';
    dmBtn.className = 'nav-pill nav-pill-dark';
    dmBtn.type = 'button';
    initDarkToggle(dmBtn);
    nav.appendChild(dmBtn);

    // Botón para plegar/desplegar la barra
    var toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Abrir menú');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'leele-nav');
    toggle.innerHTML = '<span class="nav-toggle-open">⋯</span><span class="nav-toggle-close">▾</span>';
    nav.appendChild(toggle);

    // Plegada por defecto
    nav.classList.add('is-collapsed');

    initNavCollapse(nav, toggle);

    document.body.appendChild(nav);
  }

  // === Plegar/desplegar la barra de navegación ===
  function initNavCollapse(nav, toggle) {
    function state() { return nav.classList.contains('is-collapsed'); }
    function collapse(save) {
      if (state()) return;
      nav.classList.add('is-collapsed');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
    }
    function expand() {
      if (!state()) return;
      nav.classList.remove('is-collapsed');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Cerrar menú');
    }
    toggle.addEventListener('click', function(e) {
      e.stopPropagation();
      if (state()) { expand(); } else { collapse(); }
    });
    // Clic fuera de la barra → se pliega
    document.addEventListener('click', function(e) {
      if (state()) return;
      if (nav.contains(e.target)) return;
      collapse();
    });
    // La barra se mantiene abierta al usar las píldoras; solo el toggle la pliega
    nav.addEventListener('click', function(e) {
      if (state()) return;
      if (e.target.closest && (e.target.closest('a.nav-pill') || e.target.closest('.nav-pill-dark'))) {
        e.stopPropagation();
      }
    });
  }

  function sep() {
    var s = document.createElement('span');
    s.className = 'nav-sep';
    s.setAttribute('aria-hidden', 'true');
    return s;
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

    if (!document.getElementById('leele-nav')) {
      buildNav();
    }

    addHeroGreeting();
    addAnkiDownload();
    fixFolderTitles();
    wrapSectionTitles();
    addPackageBars();
    enableFoldableHeadings();
  }

  hideElements();
  var observer = new MutationObserver(hideElements);
  observer.observe(document.body, { childList: true, subtree: true });
})();