# Historial Opencode

## Fecha: 7 de septiembre de 2026

## Objetivo
Configurar un sistema para que los estudiantes de Santiago (profesor de Español como Lengua Extranjera - ELE) puedan acceder a sus notas de Obsidian a través de una página web, sin necesidad de instalar nada.

## Decisiones tomadas

### 1. Plataforma
- **GitHub Pages** + **Quartz** (generador de sitios web para vaults de Obsidian)
- Repositorio: `Le-ELE.github.io` (el que ya existía)
- La página principal (`index.html`) se mantiene intacta
- Las notas de los estudiantes se publican en `docs/` para ser servidas por GitHub Pages

### 2. Privacidad
- URLs no adivinables: cada estudiante tiene un código alfanumérico de 6 caracteres
- Ejemplo: `le-ele.github.io/estudiantes/Leo-jxbun0/`
- No es privacidad real (GitHub Pages es público), pero es suficiente para notas de progreso

### 3. Automatización
- **Obsidian Git**: plugin para hacer commit y push automático de los cambios
- **GitHub Actions**: workflow para regenerar el sitio con Quartz cada vez que se hacen cambios
- El profesor escribe en Obsidian y el sitio se actualiza solo

## Estudiantes existentes

| Estudiante | Código | URL |
|------------|--------|-----|
| Leo | `jxbun0` | `le-ele.github.io/estudiantes/Leo-jxbun0/` |
| Rebecca | `u1e74p` | `le-ele.github.io/estudiantes/Rebecca-u1e74p/` |
| Rheis | `kggbu0` | `le-ele.github.io/estudiantes/Rheis-kggbu0/` |

## Estructura del repositorio

```
Le-ELE.github.io/
├── index.html          ← página principal (se mantiene igual)
├── style.css           ← estilos de la página principal
├── imagenes/           ← imágenes de la página principal
├── docs/               ← sitio generado por Quartz
│   ├── index.html      ← página de inicio de Quartz
│   ├── estudiantes/    ← notas de los estudiantes
│   │   ├── Leo-jxbun0/
│   │   ├── Rebecca-u1e74p/
│   │   └── Rheis-kggbu0/
│   └── ...
├── .github/workflows/
│   └── deploy-quartz.yml ← GitHub Actions configurado
├── quartz.config.yaml    ← configuración de Quartz
└── Historial Opencode.md ← este archivo
```

## Estructura del vault de Obsidian

```
Notas de ELE/
├── .obsidian/
├── estudiantes/
│   ├── Leo-jxbun0/
│   │   ├── Estructuras.md
│   │   ├── Notas.md
│   │   ├── Pretérito indefinido.md
│   │   ├── Pronombres de objeto.md
│   │   └── PDFs/
│   ├── Rebecca-u1e74p/
│   │   ├── Notas.md
│   │   └── Pronombres.md
│   └── Rheis-kggbu0/
│       ├── Notas.md
│       └── Sin título.md
├── Pasado.md
├── Pretérito imperfecto.md
└── Sin título.md
```

## Pasos ejecutados

1. **Limpiar la carpeta de trabajo**: Se eliminaron archivos existentes en `/home/zaov/Desarrollo/Página web`

2. **Clonar el repositorio**: Se clonó `https://github.com/Le-ELE/Le-ELE.github.io.git`

3. **Instalar Quartz**: Se clonó Quartz v4.5.2 en `/tmp/quartz-temp` y se instalaron dependencias

4. **Configurar Quartz**: Se creó `quartz.config.yaml` con:
   - Título: "LéELE - Notas de Estudiantes"
   - Idioma: español
   - URL base: `le-ele.github.io`
   - Fuentes: Playfair Display, Literata, IBM Plex Mono
   - Plugins esenciales habilitados

5. **Copiar notas de estudiantes**: Se copiaron las carpetas de estudiantes al `content/estudiantes/` de Quartz

6. **Generar el sitio**: Se ejecutó `npx quartz build` para generar el sitio HTML en `public/`

7. **Copiar a docs/**: Se copió el contenido generado a `docs/` del repositorio

8. **Renombrar carpetas**: Se agregaron códigos a las carpetas de los estudiantes en el vault:
   - `Leo` → `Leo-jxbun0`
   - `Rebecca` → `Rebecca-u1e74p`
   - `Rheis` → `Rheis-kggbu0`

9. **Regenerar el sitio**: Se volvió a generar el sitio con las carpetas renombradas

10. **Crear GitHub Actions**: Se creó `.github/workflows/deploy-quartz.yml` para despliegue automático

11. **Crear configuración de Quartz**: Se creó `quartz.config.yaml` en la raíz del repositorio para ser usado por GitHub Actions

## Pendientes

### 1. Configurar GitHub Actions ✅
Creado archivo `.github/workflows/deploy-quartz.yml` que:
- Se ejecuta en cada push a la rama `main`
- Clona Quartz v4.5.2
- Copia el contenido de `estudiantes/` y `quartz.config.yaml`
- Genera el sitio con `npx quartz build`
- Despliega automáticamente a GitHub Pages

### 2. Configurar Obsidian Git
- Instalar plugin en el vault
- Configurar auto-commit cada 15-30 minutos
- Configurar auto-push al repositorio

### 3. Compartir URLs con estudiantes
- Enviar a cada estudiante su URL única
- Explicar que pueden acceder desde cualquier navegador

## Notas técnicas

- **Quartz v5.0.0** tiene un bug con el plugin `PageTypeDispatcher`. Se usó **v4.5.2** que funciona correctamente.
- **GitHub Pages** es público por naturaleza. Las URLs no adivinables ofrecen privacidad básica pero no real.
- **Límites de GitHub Pages**: 1 GB por repositorio, 100 GB de ancho de banda mensual. Para texto no hay problema.
- **Obsidian Git** hace commit y push automático, pero no genera el sitio HTML. Eso lo hace GitHub Actions.

## Contacto
- Profesor: Santiago
- WhatsApp: +57 312 835 66 28
- Instagram: @santi.profe.ele
- Web: https://le-ele.github.io/
