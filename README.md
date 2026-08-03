# Cómo publicar este sitio gratis (GitHub Pages, desde Linux)

## 1. Crear cuenta y repositorio
1. Andá a https://github.com y creá una cuenta (gratis).
2. Hacé clic en **New repository**.
3. Poné como nombre exactamente: `TUUSUARIO.github.io`
   (reemplazando `TUUSUARIO` por tu nombre de usuario de GitHub, tal cual).
4. Dejalo público, sin README, y creá el repositorio.

## 2. Instalar git (si no lo tenés)
```bash
sudo apt update && sudo apt install git -y
```

## 3. Configurar git (una sola vez)
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"
```

## 4. Subir estos archivos
Desde la carpeta donde tengas estos archivos (index.html, textos.html,
sobre.html, style.css):

```bash
cd ruta/a/sitio-escuela
git init
git add .
git commit -m "Primera versión del sitio"
git branch -M main
git remote add origin https://github.com/TUUSUARIO/TUUSUARIO.github.io.git
git push -u origin main
```

GitHub te va a pedir usuario y, en vez de contraseña, un **token de acceso
personal** (Settings → Developer settings → Personal access tokens en
GitHub). Lo generás una vez y lo usás como si fuera la contraseña.

## 5. Activar la página
1. En el repositorio, andá a **Settings → Pages**.
2. En "Source" elegí la rama `main` y la carpeta `/ (root)`.
3. Guardá. En un par de minutos tu sitio va a estar en:
   `https://TUUSUARIO.github.io`

## 6. Actualizar el sitio más adelante
Cada vez que edites un archivo:
```bash
git add .
git commit -m "Actualizo textos"
git push
```
Los cambios se publican solos en 1-2 minutos.

## Para personalizar
- Cambiá los textos de ejemplo en `textos.html` por las lecturas reales.
- Completá `sobre.html` con la info real del proyecto y del curso.
- Si querés agregar más lecturas, copiá un bloque `<section>` en
  `textos.html` y sumalo también como `<li>` en la lista de `index.html`.

## Si más adelante querés un dominio propio (opcional, con costo mínimo)
1. Comprás un dominio barato (ej. Namecheap, Porkbun, Cloudflare — desde
   ~1 a 15 USD/año según la extensión).
2. En el registrador, configurás los DNS apuntando a GitHub Pages.
3. En Settings → Pages del repositorio, agregás tu dominio en "Custom domain".

No es obligatorio: el sitio funciona perfecto y gratis para siempre con
`TUUSUARIO.github.io`.
