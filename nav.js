document.addEventListener("DOMContentLoaded", function () {
  var groups = document.querySelectorAll(".has-sub");

  groups.forEach(function (group) {
    var toggle = group.querySelector(".level-toggle");
    if (!toggle) return;

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = group.classList.contains("open");
      groups.forEach(function (g) { g.classList.remove("open"); });
      if (!isOpen) group.classList.add("open");
    });
  });

  document.addEventListener("click", function () {
    groups.forEach(function (g) { g.classList.remove("open"); });
  });
});
