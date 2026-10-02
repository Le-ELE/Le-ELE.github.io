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
│   ├── Rosie-r223kd/       Estudiante activo.
│   ├── Atsuno-o23jfi/      Estudiante activo (⚠ ver §4: publica un email real).
│   ├── Nuevo estudiante/   Plantilla de estudiante (copiar y renombrar). Estructura canónica: Anki.md, Mi info.md, Paquetes.md, Plan.md, Clases/Mes/, Gramática/.
│   ├── Inactivos/          Estudiantes sin clases (igual se publica, a propósito).
│   ├── Pruebas/            Notas de prueba (Pruebas/Anki.md, con material de test). Cada estudiante tiene su propio Anki.md; el de Pruebas es el que se usa para experimentar.
│   └── Templates Obsidian/ Templates del vault (NO confundir con la carpeta "templates" de Quartz).
├── site/                   → TODO lo del portal vive acá.
│   ├── quartz.config.ts    Config REAL de Quartz (la copia el pipeline encima del vendored).
│   ├── student.css         Tema del portal: tokens, login, nav, tarjetas, hero, folds, modo oscuro.
│   ├── hide-explorer.js    Lógica del portal: login, nav, dark, folds, barras de paquete, saludo, títulos, botón de Anki.
│   └── anki_build.py       Tabla Markdown de Anki.md → .apkg descargable (se ejecuta en CI).
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
7. **Mazos de Anki**: `pip install genanki==0.13.1` + `site/anki_build.py` (ver §3.4).
8. **Inyección** (paso crítico, ver 3.2).
9. **Upload + deploy** con `actions/upload-pages-artifact@v3` y `actions/deploy-pages@v4`.

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

### 3.4 Mazos de Anki (`site/anki_build.py`)

Paso nuevo del workflow, entre el ensamblado y la inyección.

**Idea:** la tabla Markdown de `estudiantes/<Estudiante>/Anki.md` se convierte
en un `.apkg` que el estudiante descarga desde su propia página. El `.apkg` se
escribe en la misma carpeta donde Quartz dejó el `.html` de esa nota, así que
`hide-explorer.js` (`addAnkiDownload`) deduce la URL del propio path de la
página, sin ningún archivo de configuración.

```
estudiantes/Pruebas/Anki.md
  -> /tmp/site/estudiantes/Pruebas/LeELE_Anki_Pruebas.apkg
  -> https://le-ele.github.io/estudiantes/Pruebas/LeELE_Anki_Pruebas.apkg
```

**Nombre del archivo y del mazo:** el mazo que aparece **dentro de Anki** es
`LeELE_Anki_<Nombre>` y el archivo descargable es ese nombre más `.apkg`. El
prefijo va sin tilde para que la URL sea ASCII pura. Los generan
`nombre_mazo_estudiante()` / `nombre_archivo()`, y el archivo se publica en
`Anki.json` (`"archivo"`); el botón lo lee de ahí en vez de repetir la regla.

**Un solo mazo por estudiante.** Antes eran varios (`Anki/Vocabulario.md`,
`Anki/Frases.md`) en una subcarpeta `Anki/`; ahora todo el material vive en un
solo `Anki.md` en la raíz del estudiante y el deck se llama
`LeELE_Anki_<Nombre>`. Con un único mazo la subcarpeta no aportaba nada y
obligaba al botón a adivinar el nombre del archivo desde el path.

**El botón solo aparece** si el path matchea
`/estudiantes/<código>/Anki(.html)`. Los estilos viven en `.leele-anki*` dentro
de `student.css`.

**Decisiones que no romper:**

- **El GUID de cada nota se deriva SOLO del anverso** (clase `Nota.guid` en
  `anki_build.py`). Esto es lo que hace que reimportar actualice en el lugar y
  **no duplique**. El default de genanki hashea *todos* los campos: con eso, cada
  vez que se corrige una traducción aparece una tarjeta repetida. Verificado con
  la librería real de Anki 26.9.3: importar, reimportar editado → 27 notas (no
  28) y el progreso de repaso intacto.
- **Anki empareja los mazos importados por NOMBRE, no por id.** Verificado con
  Anki 26.9.3: mismo nombre + distinto id → actualiza el mazo; distinto nombre +
  mismo id → crea un mazo nuevo. Por eso `LeELE_Anki_<Nombre>` (que deriva
  `nombre_mazo_estudiante()`) tiene que ser estable: si se cambia, quien ya
  importó obtiene un mazo duplicado en vez de un rename y hay que
  borrar/renombrar el viejo a mano. El `deck_id` es cosmético.
- **El ID del modelo (`LEELE_MODEL_ID = 1607392319`) es fijo.** Si cambia, Anki
  deja de poder actualizar las notas viejas. Cambiar la estructura de la carta
  implica un modelo nuevo con otro ID.
- **El tipo de nota se llama `LéELE-Basic (and reversed card)` y tiene DOS
  plantillas** (`Carta` y `Carta invertida`), siguiendo las de Anki built-in
  para "Basic (and reversed card)". Así cada palabra se repasa en los dos
  sentidos: ver `casco` → `helmet`, y ver `helmet` → `casco`. Por eso 30 notas
  del mazo son 60 cartas.
- **Trampa verificada sobre cambiar el tipo de nota:** si el estudiante ya
  importó un `.apkg` con un tipo de nota *distinto* y se importa el nuevo,
  **Anki NO actualiza el viejo: crea uno nuevo** (con el mismo nombre y un `+`
  al final) y las notas viejas quedan en el tipo anterior, con la plantilla
  vieja. Se comprobó que NO depende del nombre ni del `mod` del `.apkg`, ni
  siquiera forzando `ImportAnkiPackageOptions.update_notetypes = ALWAYS`; solo
  depende de que las plantillas sean distintas. Como el modelo se cambió de 1 a
  2 plantillas después del primer deploy, **quien ya lo haya importado tiene que
  borrar el mazo y reimportarlo** (no se pierdo nada: no había repaso todavía).
  Imports limpios y reimports posteriores funcionan bien.
- **El `deck_id` también es estable**: `sha256(model_id|carpeta|archivo)` mapeado
  a un entero < 2³¹. Si variara, cada build crearía un mazo nuevo.
- **Un `.apkg` por archivo, no uno solo**: así se puede repasar vocabulario y
  frases por separado.
- **Un error de parseo detiene el build entero** (`sys.exit(1)`). Se prefiere que
  la web no se publique a que se publique un mazo a medias. El log dice archivo y
  fila.
- **Las columnas 1 y 2 son obligatorias**: una fila con anverso y sin reverso es
  un error de tipeo con casi toda seguridad, y el script lo rechaza.
- **Solo se toma la primera tabla** del archivo: el resto es texto para el
  estudiante.
- `genanki` se usa a propósito en vez de escribir el SQLite a mano: el esquema de
  la colección de Anki tiene detalles que no conviene mantener a mano.

**Limitaciones que hay que tener presentes:**

- **Anki no tiene push.** No existe forma de escribirle automáticamente a la
  colección de un estudiante; el siempre tiene que importar el archivo. La
  alternativa real (AnkiWeb shared decks) tampoco es automática: la doc oficial
  dice que quien ya descargó el mazo *"will not automatically receive updates"*,
  y encima habría que re-compartir a mano desde Anki desktop. Por eso el `.apkg`.
- **Anki nunca borra al reimportar.** Si una palabra se saca del vault, la
  tarjeta sigue en el Anki del estudiante: hay que borrarla a mano.
- **Cambiar el anverso crea una tarjeta nueva** (y deja la vieja). Para corregir
  el español de una palabra hay que cambiar la columna 2 y dejar la 1 igual.
- **Requiere genanki en CI** (`pip install genanki==0.13.1`). Es la única
  dependencia Python del proyecto.
- **No hay push de scheduling**: el `.apkg` se genera con las cartas en estado
  nuevo; el estudiante conserva su propio progreso, no se sobrescribe.
- **Las notas que crea el estudiante a mano no se tocan**, porque Anki les da un
  GUID aleatorio que no coincide con el `hash(anverso)` de las notas del vault.
  Verificado: 2 notas personales (`zafiro`, `cacao`) con traducción propia
  sobrevivieron a una reimportación con `casco` editado y `cántaro` agregado.
  Ojo: si el estudiante crea a mano una nota con un anverso **idéntico** a una
  palabra del vault, queda con el mismo texto pero **otra nota aparte** (no se
  fusionan), porque el GUID aleatorio no coincide. Recomendación: que las
  palabras propias vayan en otro mazo o con otro tipo de nota.

### 3.5 Privacidad

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
- [ ] **Mazos de Anki dentro de `Inactivos/`**: hoy quedan fuera. `procesar()`
  en `anki_build.py` solo mira el primer nivel
  (`estudiantes/<Estudiante>/Anki.md`), así que `Inactivos/<Estudiante>/Anki.md`
  no se convierte, y el regex del botón
  (`/^\/estudiantes\/([^/]+)\/Anki(?:\.html)?\/?$/`) no matchea rutas anidadas.
  Para incluirlos: recorrer el vault recursivamente buscando `Anki.md`,
  generalizar el botón (base = pathname sin `/Anki(.html)`) y usar el basename
  en `nombre_estudiante` (hoy `"Inactivos/Leo-jxbun0"` daría `"Inactivos/Leo"`).
  Decidido dejarlo para después.
- [ ] **Verificar en Android real** el comportamiento de la nav del portal
  (el usuario reportó una vez que el logo del botón LéELE se veía "corrido" en
  su dispositivo, que **no** se pudo reproducir con Chromium headless; el fix
  actual usa centrado absoluto, que es inmune a ese tipo de interferencia).
- [ ] Posible mejora: medir el render del portal en CI (harness headless existe
  pero vive en `/tmp`, no en el repo).
- [ ] **Riesgo de privacidad: el email de Atsuno-o23jfi** se encuentra ahora
  integrado en `Mi info.md` (tras fusión de `Info.md`). El dato ya estaba
  expuesto públicamente anteriormente; al fusionar se mantiene la información.
  Si se desea eliminarlo, hay que purgarlo también del historial de git
  (force push), no basta con editar el archivo actual.

**Notas / deuda técnica:**

- Quartz **v5 tiene un bug** con este flujo; quedarse en v4.5.2.
- Locale de Quartz válido: `"es-ES"` (`"es"` rompe el build) — ver `site/quartz.config.ts`.
- Obsidian Git auto-commitea cada minuto con mensaje `vault: fecha`; puede
  gitear los cambios de la sesión a mitad de trabajo (a veces es útil, a veces
  hay que commitearlos rápido y explícito).
- La ruta del repo **contiene un espacio** (`/home/zaov/Desarrollo/Página web`):
  siempre entrecomillar.
- **Todos los estudiantes tienen ya su `Anki.md`** (1-oct-2026). Se empezó solo
  con `Pruebas/` para no tocar las notas reales hasta validar el pipeline; una
  vez validado, se añadió el archivo a cada estudiante y a la plantilla
  `Nuevo estudiante/`. Los reales están **sin filas** hasta que se cargue
  material: eso no rompe el build (se omite el `.apkg` y la web muestra
  «todavía no tiene tarjetas»). `Pruebas/` es el que tiene material de test.
- `genanki` es la única dependencia Python del proyecto y solo se usa en CI.
  Para trabajar en local: `python3 -m venv /tmp/anki-venv && /tmp/anki-venv/bin/pip install genanki==0.13.1`.

---

## 5. Historial de la sesión (bitácora técnica)

### 5.2 Sesión 2025-10-02 · Alineación de estructura a plantilla canónica

**Objetivo:** Unificar estructura de todos los estudiantes activos con `Nuevo estudiante/` como fuente de verdad, preservando contenido.

**Decisiones:**
- Forzar archivos base (`Anki.md`, `Mi info.md`, `Paquetes.md`, `Plan.md`) a versión canónica desde plantilla.
- Fusionar `Info.md` → `Mi info.md` (mantener contenido existente).
- Mover `Notas/` → `Clases/Mes/` (preservar nombres y contenido). Registrar pendientes para integración estructurada.
- Extraer contenido de `Tareas.md` a `.Por_implementar.md` (distribución al punto 6 por fecha). Eliminar originales.
- Mantener temas existentes en `Gramática/`, añadir `Tema.md` de referencia.
- Añadir `Fecha.md` (plantilla de referencia) en `Clases/Mes/`.
- Recuperar `Paquetes.md` originales desde git: Rebecca (c8a7ce6c, 2026-09-30, 11.5h), Rheis (7bbab59, 2026-09-07, 10h). Atsuno sin contenido previo (correcto).
- Crear `.Por_implementar.md` por estudiante con acciones pendientes.

**Cambios principales:**
- Estructura: `Clases/Mes/`, `Gramática/` creadas donde faltaban.
- Archivos obsoletos eliminados: `Notas/`, `Tareas.md`, `Info.md` (tras fusionar).
- Restaurados Paquetes.md con información histórica correcta.
- Toda la información preservada; reorganización compleja registrada para implementación manual.

**Lecciones:** Usar git (blame/show) para recuperar versiones anteriores al alinear. Marcar elementos no trivialmente reestructurables con `.Por_implementar.md` para no perder información ni romper legibilidad.

---

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

### 5.1b Sesión de los mazos de Anki (30-sep-2026)

Feature pedida: que las tarjetas de Anki de los estudiantes se actualicen solas
desde el vault. Decisión tomada: **`.apkg` descargable desde la página del
estudiante**, no AnkiWeb shared decks, porque Anki no tiene push y el shared deck
tampoco actualiza solo (la doc lo dice: *"will not automatically receive
updates"*), encima de exigir re-compartir a mano desde el escritorio.

Decisiones que se tomaron con el usuario:

- **Formato de origen**: tabla Markdown en `Anki.md` (no TSV), porque
  se lee bien en Obsidian y Quartz la renderiza como tabla en la web.
- **Carta de dos lados obligatoria**: si falta la columna 2, el build falla.
- **Un mazo por archivo**, no uno con tags: `Vocabulario` y `Frases` se repasan
  por separado.
- **Origen de las tarjetas: solo `Anki.md`**, sin harvest de `Notas/`
  (el formato de las notas va libre y el parser terminaría agarrando basura).
- **Alcance: solo `Pruebas/`** para probar antes de tocar notas de estudiantes
  reales.

**Trampa grande de este feature: el GUID.** genanki por defecto hashea *todos*
los campos de la nota para el GUID. Eso está bien para decks inmutables, pero acá
rompe el requisito central: al corregir una traducción cambia el hash, aparece
una nota nueva y el estudiante ve la tarjeta duplicada. La solución fue una
subclase `Nota` con `guid = genanki.guid_for(frente)`. **Verificado con la
librería real de Anki (26.9.3), no solo con inspección del ZIP:** importar →
reimportar editado → 27 notas (no 28) y las 27 conservan `queue`/`due`/`reps`.
Como control, el mismo test con genanki puro dio 28: el duplicado era real.

| Qué | Dónde |
|---|---|
| Parser de tablas + generador | `site/anki_build.py` (`Nota.guid` = la parte crítica) |
| Botón de descarga | `hide-explorer.js` → `addAnkiDownload()` (botón) + `configurarMazo()` (manifiesto/estado) |
| Estilos | `student.css` → `.leele-anki*` |
| Paso de CI | `deploy-quartz.yml` → "Install Python deps for Anki decks" + "Build Anki decks" |
| Notas de prueba | `estudiantes/Pruebas/Anki.md` (material de test, cambia seguido) |

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
10. **Para probar si un `.apkg` realmente actualiza sin duplicar, hay que usar
    la librería de Anki, no inspección visual del ZIP.** `pip install anki` en
    un venv y:
    `Collection('/tmp/x/collection.anki2').import_anki_package(ImportAnkiPackageRequest(package_path=...))`
    (ojo: el importador está en Rust, no es `anki.importing.apkg`; y `note_ids()`
    no existe, usar `find_notes("")`). Importar, tocar `queue`/`due`/`reps` de
    algunas cartas, reimportar el `.apkg` editado y comparar. Sin ese test, el
    feature parece correcto y está roto.
11. **Al probar con la librería de Anki, guardar el estado a disco con claves
    enteras**: `json.dump` convierte las claves `int` de los IDs de nota en
    `str` y la comparación da 0/27 cuando en realidad están todas (se pierden
    varios minutos en un bug del test, no del código).
12. **Servir el sitio para probar el botón**: `python3 -m http.server` y pegar
    la URL **con `.html`**. Sin extensión devuelve 404 y parece que el JS no
    funciona, cuando en realidad el regex también acepta la forma sin extensión.
13. **El modo oscuro se lee de `localStorage`**, así que un `--dump-dom` normal
    siempre da el tema claro. Para forzarlo en un test, agregar `class="dark"`
    al `<html lang="es" dir="ltr">` del HTML servido.

### 5.3 Estado actual del sitio

- Servido en: `https://le-ele.github.io/` y `https://le-ele.github.io/estudiantes/`.
- Estudiantes activos publicados: `Jo-Lynne-i9se2x3`, `Rebecca-u1e74p`,
  `Rheis-kggbu0`, `Rosie-r223kd`, **`Atsuno-o23jfi`** (este último no está en el
  mapa de §2 ni en la lista de §5.1: la documentación se había quedado atrás del
  vault).
- Mazos de Anki: todos los estudiantes tienen ya su `Anki.md`; solo `Pruebas`
  lleva tarjetas. Los `.apkg` se publican como `LeELE_Anki_<Nombre>.apkg`.
  Probando con el usuario antes de cargar material al resto.