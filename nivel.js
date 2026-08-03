document.addEventListener("DOMContentLoaded", async function () {
  var nivel = document.body.dataset.nivel;
  var listEl = document.getElementById("lista-textos");
  var filtrosEl = document.getElementById("filtros-tema");
  if (!nivel || !listEl) return;

  var textos = [];
  try {
    var res = await fetch("data/" + nivel + ".json");
    textos = await res.json();
  } catch (err) {
    listEl.innerHTML = "<p>Todavía no hay textos cargados para este nivel.</p>";
    return;
  }

  if (!Array.isArray(textos) || textos.length === 0) {
    listEl.innerHTML = "<p>Todavía no hay textos cargados para este nivel.</p>";
    return;
  }

  // más nuevos primero
  textos.sort(function (a, b) { return new Date(b.fecha) - new Date(a.fecha); });

  function opcionesUnicas(campo) {
    var vistos = [];
    textos.forEach(function (t) {
      if (t[campo] && vistos.indexOf(t[campo]) === -1) vistos.push(t[campo]);
    });
    return vistos;
  }

  var gramaticales = opcionesUnicas("temaGramatical");
  var contenidos = opcionesUnicas("temaContenido");

  function armarOpciones(lista) {
    return lista.map(function (v) {
      return '<option value="' + v + '">' + v + "</option>";
    }).join("");
  }

  filtrosEl.innerHTML =
    '<label>Tema gramatical' +
      '<select id="sel-gramatica"><option value="Todos">Todos</option>' + armarOpciones(gramaticales) + '</select>' +
    '</label>' +
    '<label>Tema de contenido' +
      '<select id="sel-contenido"><option value="Todos">Todos</option>' + armarOpciones(contenidos) + '</select>' +
    '</label>';

  var selGramatica = document.getElementById("sel-gramatica");
  var selContenido = document.getElementById("sel-contenido");

  function formatearFecha(f) {
    var d = new Date(f + "T00:00:00");
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" }).toUpperCase();
  }

  function render() {
    var g = selGramatica.value;
    var c = selContenido.value;

    var filtrados = textos.filter(function (t) {
      var okG = g === "Todos" || t.temaGramatical === g;
      var okC = c === "Todos" || t.temaContenido === c;
      return okG && okC;
    });

    if (filtrados.length === 0) {
      listEl.innerHTML = "<p>No hay textos que combinen esos dos temas todavía.</p>";
      return;
    }

    listEl.innerHTML = filtrados.map(function (t) {
      return (
        '<div class="article-row">' +
          "<div>" +
            '<span class="byline">' + t.temaGramatical + " · " + t.temaContenido + " · " + formatearFecha(t.fecha) + "</span>" +
            "<h3><a href=\"" + t.archivo + "\">" + t.titulo + "</a></h3>" +
            '<p class="dek">' + t.resumen + "</p>" +
          "</div>" +
          '<div class="thumb"></div>' +
        "</div>"
      );
    }).join("");
  }

  selGramatica.addEventListener("change", render);
  selContenido.addEventListener("change", render);

  render();
});
