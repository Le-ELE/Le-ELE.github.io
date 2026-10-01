# LéELE · Sitio web

Página de Santiago + portal de notas para estudiantes de español (ELE).

El flujo es:

> Escribís en **Obsidian** → se hace **commit + push** automático → **GitHub Actions** regenera el sitio con **Quartz** → se publica en **GitHub Pages**.

Guardás una nota y en ~2-3 minutos está publicada.

## Publicación: qué se ve en la web

- **Todo el vault** (`estudiantes/`) se publica: cada carpeta es una URL navegable
  escribiéndola directamente en el navegador.
- Casi todo se puede cambiar libremente; lo único que **no** se publica es:
  - `.obsidian/` → ajustes internos de Obsidian.
  - `**/*.pdf` → los PDF (exportados desde Obsidian quedan ocultos).
- **Nunca** entra nada de afuera del vault: el build solo consume `estudiantes/*`.

Privacidad: GitHub Pages es un sitio **público**. La única protección es que los
códigos no se puedan adivinar (`Jo-Lynne-i9se2x3`). No publiques datos sensibles.

## Estructura del repositorio

```
Le-ELE.github.io/
├── index.html                 ← página principal: https://le-ele.github.io/
├── style.css                  ← estilos de la página principal
├── imagenes/                  ← logo_grande, logo_pequeño, santiago.jpeg
├── estudiantes/               ← VAULT de Obsidian → se publica en /estudiantes/
│   ├── index.md               ← página de acceso (login) en /estudiantes/
│   ├── Jo-Lynne-i9se2x3/      → /estudiantes/Jo-Lynne-i9se2x3/
│   ├── Rebecca-u1e74p/        → /estudiantes/Rebecca-u1e74p/
│   ├── Rheis-kggbu0/          → /estudiantes/Rheis-kggbu0/
│   ├── Rosie-r223kd/          → /estudiantes/Rosie-r223kd/
│   ├── Nuevo estudiante/      ← plantilla de estudiante nuevo (copiála y renombrala)
│   ├── Inactivos/             ← estudiantes que ya no tienen clases
│   ├── Pruebas/               ← notas de prueba
│   └── Templates Obsidian/    ← templates de Obsidian (como carpeta, también es URL)
├── site/                      ← todo lo del portal de estudiantes
│   ├── quartz.config.ts       ← configuración real de Quartz (la usa el pipeline)
│   ├── student.css            ← tema del portal (tarjetas, modo oscuro, login…)
│   ├── hide-explorer.js       ← oculta sidebars/grafos, agrega navegación y login
│   └── anki_build.py          ← convierte la tabla de Anki.md en un .apkg descargable
└── .github/workflows/
    └── deploy-quartz.yml      ← build + deploy a GitHub Pages
```

> Sobre los dos "templates": Quartz ignora por defecto una carpeta interna llamada
> `templates` (la del propio framework, no la del vault). Por eso la carpeta de
> templates del vault se llama **`Templates Obsidian`** y sí se publica.

> Ojo con los espacios en los nombres de carpeta: en la URL se publican con guiones.
> `Nuevo estudiante` → `/estudiantes/Nuevo-estudiante/`, `Templates Obsidian` →
> `/estudiantes/Templates-Obsidian/`.

## Estructura del vault (una carpeta por estudiante)

Cada estudiante es una carpeta `Nombre-código` (el código es alfanumérico y es la
"clave" de acceso). La plantilla `Nuevo estudiante/` ya trae esta estructura
lista para copiar y renombrar:

```
Nombre-código/
├── Gramática/          ← fichas de gramática (una nota por tema)
├── Notas/              ← lo que se vio en clase (una subcarpeta por mes)
│   └── Mes/
│       └── fecha.md
├── Anki.md             ← el mazo del curso (tabla Markdown, todo el material)
├── Paquetes.md         ← horas del paquete y casillas de clases
├── Plan.md             ← plan de clase y enlace público del estudiante
├── Info.md             ← datos de contacto (opcional)
└── Tareas.md           ← pendientes y checkboxes
```

## Mazos de Anki

Cada estudiante tiene **un solo mazo**, en `Anki.md`, en la raíz de su carpeta
(sin subcarpeta `Anki/`). Escribís las tarjetas como una tabla Markdown normal
y el build las convierte en un `.apkg` que el estudiante descarga desde su
propia página:

```
estudiantes/Pruebas/Anki.md   ->  /estudiantes/Pruebas/Anki.apkg
```

La tabla se lee así:

```markdown
| Español | Inglés | Nota          |
| ------- | ------ | ------------- |
| ella    | she    |               |
| la      | the    | femenino      |
```

- **La primera tabla del archivo es la que se convierte.** El resto del texto
  es para el estudiante y no genera tarjetas. Por eso no pongas ninguna otra
  tabla antes de la del mazo.
- **Hay un solo mazo por estudiante.** El archivo se llama siempre `Anki.md` y
  el mazo también `Anki`, para que al reimportar se actualice el mismo en vez
  de crear otro. Todo el material de un estudiante va a esa única tabla.
- **Un `Anki.md` sin filas no rompe el build**: genera un `Anki.json` con 0 y
  la web muestra «todavía no tiene tarjetas» en lugar de un botón roto. Es el
  estado normal de un estudiante recién creado.
- **La columna 1 es el anverso y la 2 el reverso.** La 3 (nota) es opcional y se
  muestra debajo de la respuesta.
- **Las dos primeras columnas son obligatorias.** Si una fila tiene el anverso
  pero no el reverso, el build falla y te dice qué fila es (es casi siempre un
  error de tipeo, no una tarjeta a medio hacer).
- **Cada palabra genera dos cartas** (tipo de nota `LéELE-Basic (and reversed
  card)`): una de español a inglés y otra de inglés a español. Por eso 30
  palabras son 60 cartas.

### Cómo lo importa el estudiante

Anki **no tiene push**: no hay forma de escribirle automáticamente en la
colección de un estudiante. Lo que hay es que el `.apkg` siempre está en la
misma URL y al reimportarlo **actualiza las tarjetas que cambiaron sin perder
lo que ya repasó**:

- **Escritorio (Anki 23.10 o superior)**: `Archivo > Importar`, elegir el `.apkg`.
- **AnkiDroid / AnkiMobile**: abrir el `.apkg` desde el celu (descargalo y abrilo).

Eso es solo para los cambios. No hace falta hacer nada más.

Dos cosas que conviene saber:

- Si **corregís la traducción** de una palabra o frase, la tarjeta se actualiza sola.
- Las **opciones de importación** se pueden dejar como aparecen. El `.apkg`
  solo lleva el preset `Default` que Anki ya tiene siempre, así que Anki no
  pisa los límites, el FSRS ni el resto de ajustes del estudiante: el mazo
  importado queda usando su propio preset. (Borrar esa configuración del
  paquete a mano lo rompe: Anki aborta la importación con `No such deck
  config: '1'`.)
- Si **borrás una palabra** del vault, la tarjeta sigue en el Anki del
  estudiante: hay que borrarla a mano desde Anki. Borrar del vault nunca borra
  tarjetas importadas.
- **Aviso de mazo desfasado.** GitHub Pages sirve el `.apkg` con
  `cache-control: max-age=600`, así que el navegador puede devolver una copia
  de hasta 10 minutos. Si escribís una fila y el estudiante recarga rápido,
  la página ya la muestra pero el archivo todavía no la tiene: importarlo da
  *"45 notas, todas ya presentes"* y parece un fallo. El build escribe
  `Anki.json` con el conteo del `.apkg` y una versión única (el SHA del
  commit). `hide-explorer.js` lo pide sin caché y usa esa versión como `?v=`
  en la URL de descarga, para que el navegador baje siempre el archivo nuevo.
  Si además el conteo no coincide con las filas de la tabla, avisa que espere
  en vez de dejar que importe algo incompleto.
- Si **cambiás el texto del anverso**, eso es otra tarjeta y aparece la nueva
  al lado de la vieja. Para corregir el español de una palabra, cambiá la
  columna 2 y dejá la 1 igual.

El identificador de cada tarjeta se deriva del anverso, no de la posición en la
tabla: por eso reordenar la tabla no rompe nada, pero cambiar el anverso crea
una tarjeta nueva.

**Si el estudiante agrega palabras por su cuenta:** se conservan intactas al
reimportar, porque Anki les da un identificador propio que no coincide con el
de las palabras del vault. Lo único a vigilar es que **no copie una palabra que
ya esté en el vault**: quedaría con el mismo texto pero como una tarjeta
duplicada aparte. Para eso conviene que use otro mazo.

### Probar los mazos en local

```bash
python3 -m venv /tmp/anki-venv && /tmp/anki-venv/bin/pip install genanki==0.13.1
/tmp/anki-venv/bin/python site/anki_build.py estudiantes /tmp/prueba-anki
```

El script imprime una línea por mazo. Si algo está mal (falta una traducción,
no hay tabla) imprime el archivo y la fila y **detiene el build**, para que no
se publique a medias. El `.apkg` solo queda bien si la tabla está completa.

## Cómo trabajar

### Agregar un estudiante nuevo
1. En Obsidian, copiá la carpeta `Nuevo estudiante/` dentro de `estudiantes/`.
2. Renombrala a `Nombre-código` (ej. `Ana-ab12cd`).
3. Su URL queda disponible en `https://le-ele.github.io/estudiantes/Nombre-código/`
   (el código debe ser difícil de adivinar).
4. La plantilla ya trae `Anki.md`, `Paquetes.md`, `Plan.md`, `Tareas.md`,
   `Gramática/` y `Notas/`. Editá los datos (fechas, enlace del `Plan.md`) y
   empezá a añadir material. El mazo se genera solo: mientras `Anki.md` no
   tenga filas, la página del mazo dice «todavía no tiene tarjetas».

### Editar notas existentes
Solo escribís en Obsidian. El plugin **Obsidian Git** hace commit + push cada
minuto (mensaje `vault: fecha`). El workflow se dispara solo en cada push.

### Navegar la web
- Portal de acceso: `https://le-ele.github.io/estudiantes/` (login por nombre de carpeta).
- Cualquier carpeta se abre escribiendo su URL directa, por ejemplo:
  - `https://le-ele.github.io/estudiantes/Inactivos/`
  - `https://le-ele.github.io/estudiantes/Pruebas/`
  - `https://le-ele.github.io/estudiantes/Templates-Obsidian/`

## Cómo funciona el pipeline

1. `actions/checkout` clona el repo (por eso Quartz puede calcular fechas con git).
2. `site/quartz.config.ts` se copia al checkout de **Quartz v4.5.2** (pinned).
3. `estudiantes/*` se copia como `content/` de Quartz y se corre `npx quartz build`.
4. El resultado se ensambla en `/tmp/site/` junto con `index.html`, `style.css` e `imagenes/`.
5. `site/anki_build.py` convierte la tabla de `estudiantes/*/Anki.md` en un `.apkg`
   descargable, en la misma carpeta donde Quartz dejó la página de esa nota.
6. `student.css` y `hide-explorer.js` se inyectan en cada HTML generado.
7. `actions/deploy-pages` publica el artefacto en GitHub Pages (fuente = **GitHub Actions**).

## Probar el build localmente (sin tocar el repo)

Requerimientos: Node 22 + npm.

```bash
git clone --branch v4.5.2 https://github.com/jackyzha0/quartz.git /tmp/quartz-temp
cd /tmp/quartz-temp && npm ci
cp ../site/quartz.config.ts quartz.config.ts          # config real
cp -r ../estudiantes/* content/
npx quartz build                                       # genera public/
```

El resultado en `public/` debe contener **todas** las carpetas del vault
(`Inactivos`, `Pruebas`, `Templates Obsidian`, `Nuevo estudiante`, …) y ninguna
entrada de `.obsidian` ni PDFs.

Para probar también los mazos de Anki, agregá este paso antes de `npx quartz build`:

```bash
python3 -m venv /tmp/anki-venv && /tmp/anki-venv/bin/pip install genanki==0.13.1
/tmp/anki-venv/bin/python ../site/anki_build.py ../estudiantes public/
```

El `.apkg` debe aparecer en `public/<Estudiante>/`, junto al `Anki.html` de la
tabla que lo originó.

## Notas

- **Obsidian Git**: auto-commit cada minuto, auto-push cada minuto (config en `estudiantes/.obsidian/`).
- El vault es la carpeta `estudiantes/` (por eso tiene `.obsidian/` y está ignorada en git).
- Quartz v5 no se usa: tiene un bug de compatibilidad con este flujo; la versión pinned es v4.5.2.
- En Quartz v4.5.2 el locale válido es `"es-ES"` (no `"es"`): `"es"` rompe el build.