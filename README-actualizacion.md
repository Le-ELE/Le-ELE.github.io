# Cómo reemplazar tu sitio por la versión "Lé ELE!"

## 1. Descargá esta carpeta (leele-v2)
Contiene:
- index.html
- nivel-a1.html, nivel-a2.html
- nivel-b1.html, nivel-b2.html
- nivel-c1.html, nivel-c2.html
- boletines.html
- acerca.html
- style.css

## 2. Reemplazá los archivos en tu carpeta local
En tu terminal, dentro de `~/Desarrollo/Página web/files`:

```bash
cd ~/Desarrollo/"Página web"/files

# borrá los archivos viejos del diseño anterior (menos README y .gitignore)
rm -f index.html sobre.html textos.html style.css
```

Después copiá ahí adentro todos los archivos nuevos que descargaste de
`leele-v2` (arrastralos con el explorador de archivos, o movelos con `mv`
desde tu carpeta de Descargas):

```bash
mv ~/Descargas/leele-v2/*.html ~/Descargas/leele-v2/style.css .
```//ajustá la ruta de origen según donde se haya descargado

## 3. Confirmá que están todos los archivos
```bash
ls
```
Deberías ver: `index.html`, `nivel-a1.html`, `nivel-a2.html`,
`nivel-b1.html`, `nivel-b2.html`, `nivel-c1.html`, `nivel-c2.html`,
`boletines.html`, `acerca.html`, `style.css`, `README.md`.

## 4. Subí los cambios
```bash
git add .
git commit -m "Rediseño estilo Lé ELE!"
git push
```

## 5. Esperá 1-2 minutos y refrescá
`https://le-ele.github.io`

## Para personalizar después
- Cada `nivel-XX.html` tiene textos de ejemplo — reemplazalos por las
  lecturas reales de ese nivel.
- En `index.html`, la sección "Más populares" y el artículo destacado son
  de ejemplo — actualizalos a mano cuando quieras cambiar qué se muestra.
- Los cuadros grises (`<div class="thumb">`) son lugares para imágenes.
  Para poner una imagen real, reemplazá:
  `<div class="thumb"></div>`
  por:
  `<img class="thumb" src="imagenes/nombre.jpg" alt="Descripción de la imagen">`
  (creando antes una carpeta `imagenes/` con tus fotos).
