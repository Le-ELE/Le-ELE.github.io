# LéELE · Sitio web

Página de Santiago + portal de notas para estudiantes de español (ELE).

El flujo es:

> Escribís en **Obsidian** → se hace **commit + push** automático → **GitHub Actions** regenera el sitio con **Quartz** → se publica en **GitHub Pages**.

No hay que tocar nada más: guardás una nota y en ~2-3 minutos está publicada.

## Estructura del repositorio

```
Le-ELE.github.io/
├── index.html                 ← página principal: https://le-ele.github.io/
├── style.css                  ← estilos de la página principal
├── imagenes/                  ← logo_grande, logo_pequeño, santiago.jpeg
├── estudiantes/               ← VAULT de Obsidian (la fuente del contenido)
│   ├── index.md               ← página de acceso (login) en /estudiantes/
│   ├── Jo-Lynne-i9se2x3/      → https://le-ele.github.io/estudiantes/Jo-Lynne-i9se2x3/
│   ├── Rebecca-u1e74p/        → https://le-ele.github.io/estudiantes/Rebecca-u1e74p/
│   ├── Rheis-kggbu0/          → https://le-ele.github.io/estudiantes/Rheis-kggbu0/
│   ├── Rosie-r223kd/          → https://le-ele.github.io/estudiantes/Rosie-r223kd/
│   ├── Nuevo estudiante/      ← copiá esta carpeta para crear un estudiante nuevo (NO se publica)
│   ├── Inactivos/             ← estudiantes que ya no tienen clases (NO se publica)
│   ├── Pruebas/               ← notas de prueba (NO se publica)
│   └── Templates/             ← templates de Obsidian, no de la web (NO se publica)
├── site/                      ← todo lo del portal de estudiantes
│   ├── quartz.config.ts       ← configuración real de Quartz (la usa el pipeline)
│   ├── student.css            ← tema del portal (tarjetas, modo oscuro, login…)
│   └── hide-explorer.js       ← oculta sidebars/grafos, agrega navegación y login
└── .github/workflows/
    └── deploy-quartz.yml      ← build + deploy a GitHub Pages
```

## Estructura del vault (una carpeta por estudiante)

Cada estudiante es una carpeta `Nombre-código` (el código es alfanumérico y es la
"clave" de acceso). Debería seguir esta estructura:

```
Rosie-r223kd/
├── Gramática/          ← fichas de gramática (una nota por tema)
├── Notas/              ← lo que se vio en clase
│   └── 2026-09-24/     ← una nota por fecha (Mes/Año como en Plantillas)
└── Tareas.md           ← pendientes y checkboxes
```

Las carpetas dentro de `estudiantes/` que **no** se publican están listadas en
`site/quartz.config.ts` (`ignorePatterns`): `Inactivos`, `Nuevo estudiante`,
`Pruebas`, `Templates`. Si creás una carpeta nueva que sea interna (no de un
estudiante activo), agregala ahí.

## Cómo trabajar

### Agregar un estudiante nuevo
1. En Obsidian, copiá la carpeta `Nuevo estudiante/` dentro de `estudiantes/`.
2. Renombrala a `Nombre-código` (ej. `Ana-ab12cd`).
3. Esa URL queda disponible (el código debe ser difícil de adivinar).

### Editar notas existentes
Solo escribís en Obsidian. El plugin **Obsidian Git** hace commit + push cada
minuto (mensaje `vault: fecha`). El workflow se dispara solo en cada push.

### Obtener las URLs
- Portal de acceso: `https://le-ele.github.io/estudiantes/` (buscador por nombre de carpeta)
- Notas de cada estudiante: `https://le-ele.github.io/estudiantes/Nombre-código/`

## Privacidad

GitHub Pages es **público** por naturaleza, así que esto no es una garantía real:
- La seguridad es "por oscuridad": códigos no adivinables (`Jo-Lynne-i9se2x3`, etc.).
- Las carpetas internas (`Inactivos`, `Pruebas`, `Nuevo estudiante`, `Templates`)
  quedan **fuera del build** y dan 404 en la web.
- Busqueda/Explorer/Graph de Quartz están ocultos en la interfaz.
- No publiques datos sensibles (DNI, contraseñas, direcciones).

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

El resultado debe ir a `public/`, sin `Inactivos/`, `Pruebas/`, `Templates/` ni
`Nuevo estudiante/`.

## Notas

- **Obsidian Git**: auto-commit cada minuto, auto-push cada minuto (config en `estudiantes/.obsidian/`).
- El vault es la carpeta `estudiantes/` (por eso tiene `.obsidian/` y está ignorada en git).
- Quartz v5 no se usa: tiene un bug de compatibilidad con este flujo; la versión pinned es v4.5.2.