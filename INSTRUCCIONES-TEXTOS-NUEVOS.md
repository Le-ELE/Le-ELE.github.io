# Cómo agregar un texto nuevo cada semana

Cada texto tiene DOS partes: (1) su propia página HTML con el contenido,
y (2) una línea en el archivo de datos del nivel (`data/NIVEL.json`),
para que aparezca en la lista y sea filtrable por los dos temas
(gramatical y de contenido).

## Ejemplo: agregar un texto nuevo de nivel A1

### 1. Copiá la plantilla y ponele nombre
```bash
cd textos
cp _plantilla.html a1-mi-nuevo-texto.html
```
Usá un nombre corto, sin espacios ni tildes, que describa el texto
(ej: `a1-mis-gatos.html`, `a1-el-fin-de-semana.html`).

### 2. Editá ese archivo nuevo
Abrilo con tu editor de texto y reemplazá:
- `TÍTULO DEL TEXTO` (aparece 2 veces)
- `NIVEL · TEMA GRAMATICAL · TEMA DE CONTENIDO` → por ejemplo
  `A1 · Presente de indicativo · Vida diaria`
- `FECHA · NOMBRE DEL AUTOR` → por ejemplo `04 AGO 2026 · Santiago`
- Los párrafos de ejemplo → el texto real de la lectura

### 3. Agregá la entrada en el archivo de datos del nivel
Abrí `data/a1.json` (o el nivel que corresponda) y agregá un bloque
nuevo dentro de los corchetes `[ ]`, separado por coma del anterior:

```json
{
  "titulo": "Mi nuevo texto",
  "temaGramatical": "Presente de indicativo",
  "temaContenido": "Vida diaria",
  "fecha": "2026-08-04",
  "resumen": "Un resumen corto de una línea sobre el texto.",
  "archivo": "textos/a1-mi-nuevo-texto.html"
}
```

Fijate que quede bien formado: cada bloque separado por coma, sin coma
después del último bloque. Podés usar cualquier nombre de tema que
quieras — no hay una lista cerrada, cada nombre nuevo que uses aparece
solo en los menús desplegables del nivel.

### 4. Subí los cambios
```bash
git add .
git commit -m "Agrego texto: Mi nuevo texto (A1)"
git push
```

En 1-2 minutos el texto nuevo aparece listado en `nivel-a1.html`, con
sus dos temas ya disponibles en los menús desplegables de filtro.

## Importante: no se puede probar abriendo el archivo directamente
Los menús de nivel cargan los textos con JavaScript desde los archivos
`.json`. Los navegadores bloquean esa carga cuando abrís el HTML
directo desde tu carpeta (doble clic). Para probarlo en tu compu antes
de subirlo, corré un servidor local simple:

```bash
python3 -m http.server 8000
```
y abrí `http://localhost:8000/nivel-a1.html` en el navegador. Una vez
publicado en GitHub Pages, funciona sin este paso extra.
