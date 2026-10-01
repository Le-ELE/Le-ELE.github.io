#!/usr/bin/env python3
"""
Genera archivos .apkg (Anki) desde las tablas Markdown del vault.

Se ejecuta en GitHub Actions, en el paso "Build Anki decks", DESPUES de que
Quartz genero el sitio y ANTES de la inyeccion de estilos/scripts.

Flujo:
  estudiantes/<Estudiante>/Anki.md   (tabla Markdown)
    -> /tmp/site/estudiantes/<Estudiante>/LeELE_Anki_<Nombre>.apkg

Cada estudiante tiene UN solo mazo, con todo el material del curso (palabras
y frases). El archivo se llama Anki.md y vive en la raiz del estudiante, sin
carpeta Anki/, porque un unico mazo no necesita carpeta.

Por que se importa un .apkg y no un .txt: AnkiDroid y AnkiMobile importan
.apkg directo desde el celu; los .txt/.csv obligan a pasar por el escritorio.
Ademas el .apkg reimportado ACTUALIZA las notas en el lugar y el estudiante
conserva su progreso de repaso.

Esa actualizacion depende de una sola cosa: que el GUID de cada nota sea
estable entre builds. Por eso la clase Nota de mas abajo define `guid` a
partir SOLO del texto de la cara frontal. Si el GUID se derivara de todos los
campos (que es el default de genanki), editar la traduccion crearia una nota
nueva y el estudiante terminaria con duplicados.

Dependencias: genanki (pip install genanki==0.13.1). Se usa de forma
intencional en vez de escribir el SQLite a mano: el esquema de la coleccion
de Anki tiene detalles que no conviene mantener a mano.

Uso:
    python3 anki_build.py <vault_root> <site_root>
"""

import hashlib
import json
import os
import re
import sys
import time

try:
    import genanki
except ImportError:
    print("ERROR: falta genanki. Instalalo con: pip install genanki==0.13.1")
    sys.exit(1)


# --- Constantes de identificacion -----------------------------------------
# El ID del modelo (note type) NO puede cambiar una vez que los estudiantes
# importaron el mazo: si cambia, Anki deja de poder actualizar las notas
# viejas. Es un numero fijo y Sacred. Si alguna vez hay que cambiar la
# estructura de la carta, se crea un modelo NUEVO con otro ID.
LEELE_MODEL_ID = 1607392319

# Nombre base del unico mazo de cada estudiante en el vault: da nombre al
# archivo (<Estudiante>/Anki.md) y al manifest (Anki.json). El nombre que
# aparece DENTRO de Anki es LeELE_Anki_<Nombre> (ver nombre_mazo_estudiante).
NOMBRE_MAZO = "Anki"

# Version unica de este build, que viaja en Anki.json. El boton de descarga la
# usa como ?v= para saltarse el cache de GitHub Pages (max-age=600), que si no
# sirve un .apkg viejo durante 10 minutos. El CI pasa el SHA del commit; en
# local cae a la hora del build, que basta para que la URL cambie.
VERSION = os.environ.get("LEELE_BUILD_VERSION") or str(int(time.time()))

# Plantilla de la carta: de dos lados, con carta invertida.
#
# Se siguen las plantillas estandar de Anki para "Basic (and reversed card)",
# adaptadas a los nombres de campo Frente/Reverso. La carta invertida hace que
# el estudiante practique tambien al reves: ver "she" y producir "ella".
#
# OJO: el nombre del modelo aparece en el menu de tipos de nota de Anki, asi
# que el estudiante lo ve al elegir el mazo. No cambiar el MODEL_ID (arriba):
# ese es el que permite actualizar las notas ya importadas.
LEELE_MODEL = genanki.Model(
    LEELE_MODEL_ID,
    "LéELE-Basic (and reversed card)",
    fields=[
        {"name": "Frente"},
        {"name": "Reverso"},
        {"name": "Notas"},
    ],
    templates=[
        {
            "name": "Carta",
            "qfmt": "{{Frente}}",
            "afmt": '{{FrontSide}}\n\n<hr id=answer>\n\n{{Reverso}}'
                    '{{#Notas}}<div class="nota">{{Notas}}</div>{{/Notas}}',
        },
        {
            "name": "Carta invertida",
            "qfmt": "{{Reverso}}",
            "afmt": '{{FrontSide}}\n\n<hr id=answer>\n\n{{Frente}}'
                    '{{#Notas}}<div class="nota">{{Notas}}</div>{{/Notas}}',
        },
    ],
    css=(
        ".card {\n"
        "  font-family: -apple-system, 'Segoe UI', Roboto, sans-serif;\n"
        "  font-size: 22px;\n"
        "  text-align: center;\n"
        "  color: #2d2a26;\n"
        "  background-color: #fdfbf7;\n"
        "  padding: 20px;\n"
        "}\n"
        ".card #answer {\n"
        "  margin: 16px 0;\n"
        "  border: 0;\n"
        "  border-top: 1px solid #d8d2c6;\n"
        "}\n"
        ".card .nota {\n"
        "  margin-top: 18px;\n"
        "  font-size: 15px;\n"
        "  font-style: italic;\n"
        "  color: #7a736a;\n"
        "}\n"
        ".nightMode .card { color: #ece7df; background-color: #211f1c; }\n"
        ".nightMode .card #answer { border-top-color: #3d3934; }\n"
        ".nightMode .card .nota { color: #9c958a; }\n"
    ),
)


class Nota(genanki.Note):
    """Nota con GUID estable: depende solo del frente, no de todos los campos.

    Es la pieza critica del sistema. Si el texto de una tarjeta cambia y el
    GUID tambien, el build siguiente genera una nota nueva y el estudiante
    ve la tarjeta duplicada. Con el GUID derivado solo del frente, el mismo
    frente siempre cae en la misma nota y Anki la actualiza en el lugar.
    """

    @property
    def guid(self):
        return genanki.guid_for(self.fields[0].strip().lower())


# --- Parseo de tablas Markdown --------------------------------------------

# Fila de separacion de una tabla: | --- | --- |
RE_SEPARADOR = re.compile(r"^\|[\s:|-]+\|$")
# Link de Obsidian: [[Gramática/Nota|texto]] o [[Nota]]
RE_WIKILINK = re.compile(r"\[\[([^\]|]+)(?:\|([^\]]*))?\]\]")
# Enlace markdown: [texto](url)
RE_MD_LINK = re.compile(r"\[([^\]]*)\]\([^)]*\)")
# Negrita / cursiva
RE_BOLD = re.compile(r"\*\*([^*]+)\*\*")
RE_ITALIC = re.compile(r"(?<![\*\w])\*([^*\n]+)\*(?![\*\w])")
# Salto de linea HTML, comun en las tablas de este vault
RE_BR = re.compile(r"<br\s*/?>", re.IGNORECASE)


def limpiar(celda):
    """Convierte el contenido de una celda Markdown a texto plano para Anki.

    Los campos de Anki son HTML plano: hay que quitar la sintaxis de Obsidian
    o el estudiante veria asteriscos y corchetes en la carta.
    """
    texto = celda.strip()
    texto = RE_BR.sub(" ", texto)
    texto = RE_WIKILINK.sub(lambda m: m.group(2) or m.group(1), texto)
    texto = RE_MD_LINK.sub(lambda m: m.group(1), texto)
    texto = RE_BOLD.sub(r"\1", texto)
    texto = RE_ITALIC.sub(r"\1", texto)
    texto = texto.replace("|", "/")
    return re.sub(r"\s+", " ", texto).strip()


def separar_fila(linea):
    """Divide una fila de tabla Markdown en sus celdas.

    Devuelve [] si la linea no es una fila de tabla. La primera y la ultima
    celda vienen con el pipe inicial/final, que se descartan.
    """
    if "|" not in linea:
        return []
    celdas = linea.strip().strip("|").split("|")
    return [c.strip() for c in celdas]


def leer_tarjetas(ruta):
    """Extrae las tarjetas de la primera tabla de un archivo .md.

    Formato esperado (la primera columna es el frente en espanol):
        | Espanol | Ingles | Nota opcional |
        | ------- | ------ | ------------- |
        | ella    | she    |             |

    Se toma solo la primera tabla: el resto del documento es texto libre para
    el estudiante y no son tarjetas.
    """
    with open(ruta, "r", encoding="utf-8") as f:
        lineas = f.read().split("\n")

    # Buscar el inicio de la tabla: una fila seguida de su separador.
    inicio = None
    for i in range(len(lineas) - 1):
        if not separar_fila(lineas[i]):
            continue
        if RE_SEPARADOR.match(lineas[i + 1].strip()):
            inicio = i
            break

    if inicio is None:
        raise ValueError(
            "no se encontro ninguna tabla Markdown en {0}".format(ruta)
        )

    tarjetas = []
    # Saltar la fila de cabecera y la de separacion.
    for linea in lineas[inicio + 2:]:
        celdas = separar_fila(linea)
        if not celdas:
            break  # fin de la tabla
        if all(not c for c in celdas):
            continue

        frente = limpiar(celdas[0])
        reverso = limpiar(celdas[1]) if len(celdas) > 1 else ""
        extra = limpiar(celdas[2]) if len(celdas) > 2 else ""

        if not frente:
            continue

        # El usuario pidio tarjetas siempre de dos lados: una fila con el
        # reverso vacio casi siempre es un error de tipeo, no una tarjeta
        # intencional a medio hacer. Se corta el build, en vez de generar una
        # carta con un lado vacio.
        if not reverso:
            raise ValueError(
                'fila "{0}" de {1}: falta la traduccion (columna 2). '
                "Toda tarjeta necesita los dos lados.".format(frente, ruta)
            )

        tarjetas.append([frente, reverso, extra])

    return tarjetas


# --- Generacion ------------------------------------------------------------

def id_estable(*partes):
    """Numero entero derivado de un hash, dentro del rango que Anki usa para IDs.

    Se usa para el ID del mazo, que tiene que ser el mismo en cada build para
    que el mazo del estudiante se actualice en vez de duplicarse.
    """
    clave = "|".join(str(p) for p in partes)
    crudo = int(hashlib.sha256(clave.encode("utf-8")).hexdigest()[:8], 16)
    return (crudo % (2 ** 31 - 1000)) + 1000


def slug_carpeta(carpeta):
    """'Nuevo estudiante' -> 'Nuevo-estudiante', como lo publica Quartz.

    Quartz reemplaza los espacios del nombre de carpeta por guiones al
    publicar (la pagina queda en /estudiantes/Nuevo-estudiante/). El .apkg y
    el Anki.json tienen que quedar en esa misma ruta o el boton de descarga no
    los encuentra. Las carpetas de estudiante no llevan espacios
    (Nombre-codigo), asi que en la practica esto solo afecta a la plantilla.
    """
    return carpeta.replace(" ", "-")


def nombre_estudiante(carpeta):
    """'Jo-Lynne-i9se2x3' -> 'Jo-Lynne', usando la misma regla del saludo del portal.

    Se replica el criterio de hide-explorer.js: nombre separado del codigo por
    el ultimo guion, codigo alfanumerico de 5+ caracteres con al menos un
    digito.
    """
    partes = re.match(r"^(.+)-([a-zA-Z0-9]+)$", carpeta)
    if not partes:
        return carpeta
    nombre, codigo = partes.group(1), partes.group(2)
    if len(codigo) < 5 or not re.search(r"[0-9]", codigo):
        return carpeta
    return nombre


def nombre_mazo_estudiante(carpeta):
    """'Rebecca-u1e74p' -> 'LeELE_Anki_Rebecca'.

    Nombre del mazo tal como aparece DENTRO de Anki, y prefijo del archivo. El
    prefijo va sin tilde (LeELE_) a proposito: asi la URL es ASCII pura y evita
    lios de codificacion en la CDN. Los espacios (solo la plantilla) pasan a
    guiones.
    """
    nombre = re.sub(r"\s+", "-", nombre_estudiante(os.path.basename(carpeta)))
    return "LeELE_Anki_" + nombre


def nombre_archivo(carpeta):
    """'Rebecca-u1e74p' -> 'LeELE_Anki_Rebecca.apkg'.

    Nombre con el que el estudiante descarga el mazo: el mismo del mazo mas la
    extension. Lo lee el boton desde Anki.json.
    """
    return nombre_mazo_estudiante(carpeta) + ".apkg"


def construir_deck(tarjetas, nombre_mazo, deck_id, tags):
    deck = genanki.Deck(deck_id, nombre_mazo)
    deck.add_model(LEELE_MODEL)
    for campos in tarjetas:
        deck.add_note(Nota(model=LEELE_MODEL, fields=campos, tags=list(tags)))
    return deck


def procesar(vault_root, site_root):
    """Recorre el vault, genera un .apkg por tabla y lo deja en el sitio.

    `vault_root` es la carpeta estudiantes/ del repo y `site_root` es donde
    Quartz dejo el sitio (en CI: /tmp/site/estudiantes).

    Devuelve (generados, errores), donde cada elemento es una tupla
    (ruta, mensaje) con la cantidad de tarjetas o el error.
    """
    generados, errores, vacios = [], [], []

    if not os.path.isdir(vault_root):
        return generados, errores, vacios

    entradas = sorted(os.listdir(vault_root))
    for carpeta in entradas:
        ruta_estudiante = os.path.join(vault_root, carpeta)
        # No es una carpeta de estudiante: templates, Pruebas, etc.
        if not os.path.isdir(ruta_estudiante):
            continue

        # El mazo del curso es un unico archivo: <Estudiante>/Anki.md
        ruta_md = os.path.join(ruta_estudiante, NOMBRE_MAZO + ".md")
        if not os.path.isfile(ruta_md):
            continue

        estudiante = nombre_estudiante(carpeta)
        # Nombre visible dentro de Anki: LeELE_Anki_<Nombre>.
        nombre_mazo = nombre_mazo_estudiante(carpeta)

        try:
            tarjetas = leer_tarjetas(ruta_md)
        except Exception as e:
            errores.append((ruta_md, str(e)))
            continue

        # Una tabla sin filas no es un error: es un estudiante recien creado
        # (o la plantilla) que todavia no tiene tarjetas. Se omite el .apkg,
        # pero se le escribe Anki.json con 0 para que la web muestre "todavia
        # no hay tarjetas" en vez de un boton de descarga roto.
        if not tarjetas:
            vacios.append(ruta_md)
            continue

        # Anki empareja los mazos importados por NOMBRE, no por id (verificado
        # con la libreria real de Anki 26.9.3): mientras el nombre no cambie,
        # reimportar actualiza el mazo en vez de crear uno al lado. Por eso
        # nombre_mazo_estudiante() tiene que ser estable en el tiempo. El id es
        # cosmetico, pero se deja estable por estudiante.
        deck_id = id_estable(LEELE_MODEL_ID, carpeta, nombre_mazo)
        tags = [estudiante, nombre_mazo]
        deck = construir_deck(tarjetas, nombre_mazo, deck_id, tags)

        # El .apkg se escribe junto a la pagina de esa nota, asi el boton de
        # descarga puede deducir la URL a partir del path de la pagina. Se usa
        # el nombre con guiones (slug) porque asi publica Quartz la carpeta, y
        # el nombre de archivo LeELE_Anki_<Nombre>.apkg.
        carpeta_slug = slug_carpeta(carpeta)
        os.makedirs(os.path.join(site_root, carpeta_slug), exist_ok=True)
        destino = os.path.join(site_root, carpeta_slug, nombre_archivo(carpeta))

        try:
            genanki.Package(deck).write_to_file(destino)
        except Exception as e:
            errores.append((destino, str(e)))
            continue

        generados.append((destino, len(tarjetas)))

    return generados, errores, vacios


def escribir_manifest(vault_root, site_root, generados):
    """Escribe <Estudiante>/Anki.json para que el boton sepa que ofrecer.

    El JSON lleva:
      - notas: cuantas tarjetas tiene el .apkg.
      - archivo: el nombre del .apkg (LeELE_Anki_<Nombre>.apkg), para que el
        frontend no tenga que repetir la regla de nombres.
      - version: el SHA del build, que el boton usa como ?v= para saltarse el
        cache de GitHub Pages (max-age=600).

    El boton compara `notas` con las filas de la tabla que ve el estudiante.
    Si no coinciden, el .apkg que ofrece el navegador es una copia vieja y se
    le avisa que espere en vez de importarlo y creer que fallo.

    El archivo se escribe aunque el build haya fallado, para que un error de
    parseo se muestre como "desfasado" y no como pagina rota.
    """
    ruta_manifests = os.path.join(site_root)
    os.makedirs(ruta_manifests, exist_ok=True)

    # slug de carpeta -> (cantidad, nombre del .apkg)
    conteo = {}
    for ruta, cantidad in generados:
        carpeta = os.path.basename(os.path.dirname(ruta))
        conteo[carpeta] = (cantidad, os.path.basename(ruta))

    # Anadir tambien los que tienen Anki.md pero no generaron mazo (tabla
    # vacia o error de parseo), con 0, para que la web pueda avisar en vez de
    # ofrecer un .apkg que no existe.
    for entrada in sorted(os.listdir(vault_root)):
        ruta_estudiante = os.path.join(vault_root, entrada)
        if not os.path.isdir(ruta_estudiante):
            continue
        if not os.path.isfile(
            os.path.join(ruta_estudiante, NOMBRE_MAZO + ".md")
        ):
            continue
        conteo.setdefault(
            slug_carpeta(entrada), (0, nombre_archivo(entrada))
        )

    for carpeta, (cantidad, archivo) in conteo.items():
        destino = os.path.join(
            ruta_manifests, carpeta, NOMBRE_MAZO + ".json"
        )
        os.makedirs(os.path.dirname(destino), exist_ok=True)
        with open(destino, "w", encoding="utf-8") as f:
            json.dump(
                {"notas": cantidad, "version": VERSION, "archivo": archivo},
                f,
            )


def main():
    if len(sys.argv) != 3:
        print("Uso: python3 anki_build.py <vault_root> <site_root>")
        sys.exit(2)

    vault_root, site_root = sys.argv[1], sys.argv[2]
    generados, errores, vacios = procesar(vault_root, site_root)

    for ruta, cantidad in generados:
        kb = os.path.getsize(ruta) / 1024.0
        print(
            "Anki: {0} ({1} tarjetas, {2:.1f} KB)".format(
                os.path.relpath(ruta, site_root), cantidad, kb
            )
        )

    for ruta in vacios:
        print(
            "Anki: {0} sin tarjetas todavia (se omite el mazo)".format(
                os.path.relpath(ruta, vault_root)
            )
        )

    # El manifest se escribe siempre, incluso con errores: asi el boton de la
    # web puede avisarle al estudiante que espere, en vez de servirle un
    # .apkg viejo haciendole creer que la carga fallo.
    try:
        escribir_manifest(vault_root, site_root, generados)
    except Exception as e:
        print(
            "ERROR escribiendo el manifest de Anki: {0}".format(e),
            file=sys.stderr,
        )

    for ruta, mensaje in errores:
        print("ERROR en {0}: {1}".format(ruta, mensaje), file=sys.stderr)

    if not generados and not errores and not vacios:
        print("Anki: ningun estudiante tiene {0}.md todavia".format(NOMBRE_MAZO))

    # Un error de parseo detiene el build a proposito: es preferible que la
    # web no se publique a que se publique un mazo incompleto. El mensaje de
    # error dice que archivo y que fila mirar.
    if errores:
        print(
            "Anki: {0} archivo(s) con errores, build detenido".format(
                len(errores)
            ),
            file=sys.stderr,
        )
        sys.exit(1)

    print("Anki: {0} mazo(s) generados".format(len(generados)))


if __name__ == "__main__":
    main()