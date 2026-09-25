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
│   └── hide-explorer.js       ← oculta sidebars/grafos, agrega navegación y login
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
"clave" de acceso). Debería seguir esta estructura:

```
Rosie-r223kd/
├── Gramática/          ← fichas de gramática (una nota por tema)
├── Notas/              ← lo que se vio en clase
│   └── 2026-09-24.md   ← una nota por fecha (Mes/Año)
└── Tareas.md           ← pendientes y checkboxes
```

## Cómo trabajar

### Agregar un estudiante nuevo
1. En Obsidian, copiá la carpeta `Nuevo estudiante/` dentro de `estudiantes/`.
2. Renombrala a `Nombre-código` (ej. `Ana-ab12cd`).
3. Su URL queda disponible en `https://le-ele.github.io/estudiantes/Nombre-código/`
   (el código debe ser difícil de adivinar).

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
5. `student.css` y `hide-explorer.js` se inyectan en cada HTML generado.
6. `actions/deploy-pages` publica el artefacto en GitHub Pages (fuente = **GitHub Actions**).

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

## Notas

- **Obsidian Git**: auto-commit cada minuto, auto-push cada minuto (config en `estudiantes/.obsidian/`).
- El vault es la carpeta `estudiantes/` (por eso tiene `.obsidian/` y está ignorada en git).
- Quartz v5 no se usa: tiene un bug de compatibilidad con este flujo; la versión pinned es v4.5.2.
- En Quartz v4.5.2 el locale válido es `"es-ES"` (no `"es"`): `"es"` rompe el build.