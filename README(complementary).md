# LéELE · README complementario

Documento **complementario** a `README.md`. Explica con más profundidad de qué
se compone el proyecto, cómo funciona de punta a punta, qué queda pendiente y
guarda un **historial de la sesión** (bitácora técnica) para que una sesión
futura encuentre rápido cada pieza y cada "trampa" ya resuelta.

> Regla de oro: **todo lo visual/lógico del portal vive en `site/student.css` y
> `site/hide-explorer.js`, y se inyecta en cada página generada por el workflow.**
> El frontend del portal no es una app, es CSS + JS "post-procesado" sobre HTML
> que genera Quartz.

---

## 1. Qué hace el proyecto

Dos sitios en uno:

- **Página principal** (`/`): la landing de LéELE (Santiago, profesor de ELE),
  con precios, links a Substack/Instagram/Vaki y una barra de navegación propia
  vertical (colapsable) con el tema claro/oscuro.
- **Portal de estudiantes** (`/estudiantes/`): el **vault de Obsidian** convertido
  en un sitio de notas. Cada carpeta de un estudiante (`Nombre-código`) es una URL
  con su clave de acceso. Incluye:
  - Página de acceso (login por nombre de carpeta, primer nivel).
  - Nav por estudiante: botón LéELE (logo), Volver, Mi Inicio, modo oscuro y un
    toggle que pliega/despliega la barra.
  - Saludo "Hola, Nombre!" + logo en la portada de cada carpeta de estudiante.
  - Títulos de títulos plegables (tipo Obsidian, se recuerdan por página).
  - Barras de progreso automáticas para paquetes de clases (checkboxes).
  - Modo oscuro persistente (`localStorage`, clave `leele-dark`) en todo el sitio.
  - Tarjetas de contenidos estilo portales de notas, con la estética LéELE.

Flujo de publicación:

> **Escribís en Obsidian** → *Obsidian Git* hace commit+push automático (cada minuto)
> → **GitHub Actions** regenera el sitio con **Quartz v4.5.2** → **GitHub Pages**.

Todo el detalle operativo está en `README.md`. Este documento profundiza en la
arquitectura y el historial.

---

## 2. De qué se compone (mapa de piezas)

```
Página web/
├── index.html              Landing (/). Incluye el nav vertical #index-nav y su JS (sun/moon, toggle).
├── style.css               Estilos de la landing. Los overrides del nav vertical están AL FINAL del archivo (#index-nav…).
├── imagenes/
│   ├── logo_grande.png     Logo grande → hero del portal (/imagenes/logo_grande.png).
│   ├── logo_pequeño.png    Logo chico → login, landing, favicon del index.
│   ├── logo_favicon.png    Círculo blanco + logo (512×512 RGBA, esquinas transparentes).
│   │                       Favicon de TODAS las páginas del portal y del botón LéELE de la nav.
│   └── santiago.jpeg       Foto de perfil de la landing.
├── estudiantes/            EL VAULT de Obsidian → se publica completo como /estudiantes/*.
│   ├── .obsidian/          (usuario, ignorado en git y nunca publicado).
│   ├── index.md            Login page en /estudiantes/.
│   ├── Jo-Lynne-i9se2x3/   Estudiante activo → su hero saluda "Jo Lynne".
│   ├── Rebecca-u1e74p/     Estudiante activo.
│   ├── Rheis-kggbu0/       Estudiante activo.
│   ├── Rosie-r223kd/       Estudiante activo (estructura modelo: Gramática/ · Notas/ · Tareas.md).
│   ├── Nuevo estudiante/   Plantilla de estudiante (copiar y renombrar).
│   ├── Inactivos/          Estudiantes sin clases (igual se publica, a propósito).
│   ├── Pruebas/            Notas de prueba.
│   └── Templates Obsidian/ Templates del vault (NO confundir con la carpeta "templates" de Quartz).
├── site/                   → TODO lo del portal vive acá.
│   ├── quartz.config.ts    Config REAL de Quartz (la copia el pipeline encima del vendored).
│   ├── student.css         Tema del portal: tokens, login, nav, tarjetas, hero, folds, modo oscuro.
│   └── hide-explorer.js    Lógica del portal: login, nav, dark, folds, barras de paquete, saludo, títulos.
├── .github/workflows/
│   └── deploy-quartz.yml   Build + inyección + deploy a GitHub Pages.
└── README.md               Documentación operativa (flujo, agregar estudiante, probar local).
```

Referencias internas útiles (para futuras sesiones):

| Pieza | Dónde |
|---|---|
| Botón LéELE de la nav (logo) | `site/hide-explorer.js:306-311` (marca `nav-pill-brand`, `<img src="/imagenes/logo_favicon.png">`) |
| CSS del botón LéELE (centrado absoluto) | `site/student.css` bloque `.nav-pill-brand.nav-pill-brand` (~líneas 374+) |
| Barra de navegación del portal | `site/hide-explorer.js:293-363` (`buildNav`), collapse en `initNavCollapse` `:366-397` |
| Nav vertical de la landing | `index.html:126-193` (HTML+JS inline) y overrides css al final de `style.css` |
| Login page | `site/hide-explorer.js:38-118` (form + fetch + botón de modo oscuro) |
| Saludo "Hola, Nombre!" | `site/hide-explorer.js:221-255` (`addHeroGreeting`) — regla: folder `Nombre-código`, código alfanumérico ≥5 chars con al menos un dígito |
| Título de tarjetas de carpeta | `site/hide-explorer.js:277-290` (`wrapSectionTitles`) |
| Título de carpetas (último segmento) | `site/hide-explorer.js:258-274` (`fixFolderTitles`) |
| Barras de progreso de paquetes | `site/hide-explorer.js:124-155` (`addPackageBars`) — se activan si el artículo contiene "Paquete" |
| Títulos plegables | `site/hide-explorer.js:158-218` (persistencia por ruta en `leele-folds:*`) |
| Inyección (workflow) | `.github/workflows/deploy-quartz.yml:62-88` — paso `python3 - <<'PY'` |
| Regex de favicon | `.github/workflows/deploy-quartz.yml:79` |

---

## 3. Cómo funciona

### 3.1 Pipeline de publicación (GitHub Actions)

El workflow `deploy-quartz.yml` escribe un sitio estático completo en `/tmp/site`
y lo publica:

1. **Checkout** del repo (con historial git; Quartz usa fechas de git).
2. **Install Quartz**: clona `jackyzha0/quartz`, hace checkout de **v4.5.2** y `npm ci`.
3. **Content**: `estudiantes/*` → `content/` del Quartz local.
4. **Config**: `site/quartz.config.ts` → `quartz.config.ts` del checkout (sobreescribe el vendored).
5. **Build**: `npx quartz build` → `public/`.
6. **Ensamblado**: `public/*` → `/tmp/site/estudiantes/`, más `index.html`, `style.css`, `imagenes/`,
   `.nojekyll` y `static/og-image.png` (copia de `logo_grande.png`).
7. **Inyección** (paso crítico, ver 3.2).
8. **Upload + deploy** con `actions/upload-pages-artifact@v3` y `actions/deploy-pages@v4`.

### 3.2 La inyección (cómo el portal "aparece" en cada HTML)

Un único paso de Python (heredoc) recorre `**/*.html` de `/tmp/site/estudiantes/` y hace:

- `Quartz 4` → `LéELE`, `Folder:` → `Carpeta:` (etiquetas de idioma).
- Favicon → `re.sub` que reemplaza `<link rel="icon" href=".../static/icon.png"/>` por
  `/imagenes/logo_favicon.png` (soporta `./`, `../`, `../../`).
- `og:image` → el `og-image.png` local; dimensiones 1080×1080.
- Elimina el contador de items de carpeta (`<p>N items under this folder.` en es/en).
- Inserta `<style>student.css</style>` **justo antes de `</head>`** y
  `<script>hide-explorer.js</script>` **antes de `</body>`**.

Así, `hide-explorer.js` al cargar: restaura el modo oscuro, decide si es la
**login page** (`/estudiantes/`) o una **página de estudiante**, oculta sidebars/
breadcrumbs/grafos de Quartz, reconstruye el grid central, monta la nav y aplica
las mejoras (saludo, títulos, folds, barras). Un `MutationObserver` re-aplica todo
si Quartz muta el DOM.

### 3.3 Decisiones de diseño clavadas (no romper)

- **Publicación total del vault**: `ignorePatterns = ["private","templates",".obsidian","**/*.pdf"]`
  (en `site/quartz.config.ts`). Ojo: la carpeta de templates del vault se llama
  `Templates Obsidian` a propósito (la `templates` de Quartz la ignora el framework).
- **Modo oscuro global**: variable `leele-dark` en `localStorage`. El toggle del
  portal usa `<span class="nav-ico">` con SVGs sol/luna; la landing usa
  `INDEX_SUN`/`INDEX_MOON` (mismos SVGs).
- **Botón LéELE**: 40×40, `display:flex` centrado, logo 32×32 con
  `position:absolute; inset:0; margin:auto` (centrado a prueba de reglas globales
  de Quartz sobre `<img>`). Esquema invertible:
  - Claro: fondo `#2d2a26` (oscuro) + logo claro (`filter: invert(1)`).
  - Oscuro: fondo blanco + logo negro.
  - El dual se logra con `html.dark` y `filter: invert(...)`.
- **Tarjetas de carpetas**: override sobre el grid de Quartz
  (`li.section-li > .section` → `display:flex; flex-direction:column`). Sin este
  override, la tarjeta usa solo 1 de 3 columnas y rompe el ancho.
- **Nav de la landing vertical**: es una página estática, el nav se clava en
  `index.html` (no se inyecta). Al final de `style.css` están los overrides
  (`#index-nav { flex-direction: column; ... }`).

### 3.4 Privacidad

GitHub Pages es público. La única protección es el **código no adivinable** en el
nombre de carpeta (ej. `Jo-Lynne-i9se2x3`). No publicar datos sensibles. El login
solo navega a `/estudiantes/<código>/`; no hay contraseña real.

---

## 4. Qué falta hacer (pendientes y notas)

**Pendientes / ideas (no bloquean el sitio):**

- [ ] **Guardar el script de generación de `logo_favicon.png`** en el repo
  (se hizo ad-hoc con PIL: círculo blanco 512×512 + arte de `logo_pequeño.png`
  recortado al bbox, escalado 56 %, centrado). Sin el script, regenerar el asset
  requiere re-derivar el proceso.
- [ ] **Decidir visibilidad de `Inactivos/` y `Pruebas/`**: hoy se publican a
  propósito (URLs directas). Si algún día deben ocultarse, hay que tocar
  `quartz.config.ts` (no borrarlos del disco).
- [ ] **Verificar en Android real** el comportamiento de la nav del portal
  (el usuario reportó una vez que el logo del botón LéELE se veía "corrido" en
  su dispositivo, que **no** se pudo reproducir con Chromium headless; el fix
  actual usa centrado absoluto, que es inmune a ese tipo de interferencia).
- [ ] Posible mejora: medir el render del portal en CI (harness headless existe
  pero vive en `/tmp`, no en el repo).

**Notas / deuda técnica:**

- Quartz **v5 tiene un bug** con este flujo; quedarse en v4.5.2.
- Locale de Quartz válido: `"es-ES"` (`"es"` rompe el build) — ver `site/quartz.config.ts`.
- Obsidian Git auto-commitea cada minuto con mensaje `vault: fecha`; puede
  gitear los cambios de la sesión a mitad de trabajo (a veces es útil, a veces
  hay que commitearlos rápido y explícito).
- La ruta del repo **contiene un espacio** (`/home/zaov/Desarrollo/Página web`):
  siempre entrecomillar.

---

## 5. Historial de la sesión (bitácora técnica)

Sesión de pulido del portal y la landing (tarde del 24-seto-24 sep, commits del
`bb3784f` al `65348fc`). Orden cronológico y hallazgos para no repetir errores.

### 5.1 Lo que se hizo, commit por commit

| Commit | Qué cambió |
|---|---|
| `bb3784f` | Modo oscuro: invertir los logos negro/transparente del hero y del login (same trick que el index). |
| `04810aa` | Saludo personalizado en carpetas de estudiantes: logo + "Hola, Nombre!" + `<title>` "LéELE: Nombre". Regla: folder `Nombre-código`, código alfanumérico ≥5 chars con ≥1 dígito. |
| `2ad0e72` | Título de carpetas solo con el último segmento (`Carpeta: A/B` → `B`). |
| `d4868bd` | Títulos de tarjetas cortan en espacios (`overflow-wrap: break-word`), no en mitad de palabra. |
| `3bbcecc` | Quitar la flecha `›` de las tarjetas y agrandar la rejilla (230px escritorio / 180px móvil). |
| `a8335ff` | **Fix importante**: tarjetas en columna (`display:flex; flex-direction:column !important`). El grid de Quartz `li.section-li>.section` (3 columnas: meta/desc/tags) hacía que la descripción usara solo 1/3 del ancho. Título a 16px. |
| `e106927` | Logo del hero: 300→190px y margen superior 2.5→1.5rem (estaba muy grande/bajo). |
| `14b372f` | Nav de la landing **vertical** estilo portal (píldoras, íconos SVG iguales al portal, modo oscuro con SVGs sol/luna). |
| `642bad1` | Toggle de la nav del index fijo a la izquierda; experimento de íconos invertidos. |
| `3f40ab2` | Toggle correcto: **abierto muestra `V` (colapsar), cerrado muestra `⋯` (más)**. Se corrigió `642bad1`, que los había puesto al revés. |
| `194346c` | (CI fallida) Primer intento de favicon: la línea `re.sub(...)` con comillas dobles rompió el quoting de `python3 -c "..."`. |
| `699f472` | (auto-commit de Obsidian) Reescribir el paso de inyección a heredoc `python3 - <<'PY'` → CI verde. Favicon del portal = logo_favicon.png en todas las páginas (incluida la login y carpetas profundas). |
| `de3849e` | Generar `imagenes/logo_favicon.png` (círculo blanco + arte, RGBA). *Ojo*: el primer intento guardó RGB (esquinas negras); hay que preservar alpha. |
| `d498225` | Botón LéELE de la nav del portal: de texto a imagen (`/imagenes/logo_favicon.png`) con esquema invertible según el tema. |
| `65348fc` | **Centrado definitivo**: píldora 40×40 flex-centrada + logo 32×32 `position:absolute; inset:0; margin:auto`. Se hizo tras investigar un reporte de "logo corrido" que no se reproducía en Chromium headless (layout calculado daba centrado perfecto; el centrado absoluto elimina cualquier interferencia de reglas globales de Quartz sobre `img`). |

Deploys verificados vía `gh run list` (todos `success` en ~45-60 s).

### 5.2 Trampas aprendidas (leer en futuras sesiones)

1. **Comillas dentro de `python3 -c "..."`** rompen el workflow → usar heredoc
   `python3 - <<'PY' ... PY` (así quedó en `deploy-quartz.yml`).
2. **El primer `<style>` del HTML servido es el de Quartz, no el nuestro.**
   Si intentás extraer el CSS de la página para medir, vas a medir el CSS
   equivocado. Nuestro `<style>` es el que va **justo antes de `</head>`**;
   mejor usar el `site/student.css` local (autoritativo).
3. **`--dump-dom` de Chrome escapa `"` como `&quot;`**: para leer un atributo
   JSON, matchear `data-dbg=[^ >]*` y hacer `html.unescape` antes de `json.loads`.
4. **Harness headless**: usar el Chromium de Playwright en caché
   (`~/.cache/ms-playwright/chromium_headless_shell-1208/.../chrome-headless-shell`)
   con `--headless --screenshot` / `--dump-dom --virtual-time-budget=2000`.
   Firefox headless no produce screenshots en este entorno.
5. **Obsidian Git auto-commit/push cada minuto** (mensaje `vault: ...`). No
   sorprenderse si aparece un commit extra; conviene commitear los cambios
   propios rápido y explícito.
6. **El botón LéELE usa `/imagenes/logo_favicon.png`** (ruta absoluta, en la
   raíz del sitio, no dentro de `estudiantes/`). No renombrar el archivo sin
   actualizar `hide-explorer.js` y la regex del workflow.
7. **Centrado del logo**: no tocar la regla `position: absolute; inset: 0;
   margin: auto` del `.nav-pill-brand .nav-ico img`; es lo que lo mantiene
   centrado a prueba de todo.
8. **Espacio en la ruta** del repo: entrecomillar siempre en bash/scp.
9. **Medición de rects**: `getBoundingClientRect` en un harness con el CSS
   correcto (mismo viewport que el dispositivo en cuestión: 380px para móvil,
   donde el override `.nav-pill { padding:9px }` de la media query pierde contra
   `.nav-pill-brand.nav-pill-brand` solo porque el selector duplicado sube la
   especificidad a 0,2,0).

### 5.3 Estado actual del sitio

- Servido en: `https://le-ele.github.io/` y `https://le-ele.github.io/estudiantes/`.
- "HEAD" operativo: `65348fc` (logo centrado), CI verde.
- Estudiantes activos publicados: `Jo-Lynne-i9se2x3`, `Rebecca-u1e74p`,
  `Rheis-kggbu0`, `Rosie-r223kd`.