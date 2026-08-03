# Simplificar el sitio a una sola página

## 1. Borrá todo lo que no vas a usar
En tu terminal, dentro de `~/Desarrollo/Página web/files`:

```bash
cd ~/Desarrollo/"Página web"/files

rm -rf textos data
rm -f acerca.html boletines.html nav.js nivel.js
rm -f nivel-a1.html nivel-a2.html nivel-b1.html nivel-b2.html nivel-c1.html nivel-c2.html
rm -f sitio-escuela.zip README.md README-actualizacion.md INSTRUCCIONES-TEXTOS-NUEVOS.md
```

**Ojo**: esto NO borra tu carpeta `imagenes/` con la foto — la necesitamos.

## 2. Confirmá qué quedó
```bash
ls -la
```
Deberías ver solo: `.git`, `.gitignore`, `imagenes/` (con tu foto adentro).

## 3. Copiá los 2 archivos nuevos
Descargá `index.html` y `style.css` de acá abajo y ponelos en esa misma
carpeta (van a reemplazar los que ya tenías).

## 4. Confirmá que la foto sigue en su lugar
```bash
ls imagenes/
```
Debería aparecer `santiago.jpeg`. Si por algún motivo no está, copiala
de nuevo ahí.

## 5. Subí los cambios
```bash
git add -A
git commit -m "Simplifico el sitio a una sola página"
git push
```

`git add -A` es importante acá (en vez de `git add .`) porque también
registra los archivos que borraste, no solo los nuevos.

## 6. Esperá 1-2 minutos y refrescá
`https://le-ele.github.io` (con Ctrl+Shift+R para forzar la actualización)

Deberías ver solo tu foto, tu historia y el contacto — nada de menús ni
niveles.
