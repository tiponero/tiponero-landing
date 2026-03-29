(function () {
  var COOLDOWN = 1000;
  var locked = false;
  var main = document.querySelector("main");

  function getSections() {
    return Array.from(document.querySelectorAll(".snap-section"));
  }

  function currentIndex(sections) {
    var mid = main.scrollTop + main.clientHeight / 2;
    var idx = 0;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= mid) idx = i;
    }
    return idx;
  }

  window.addEventListener(
    "wheel",
    function (e) {
      e.preventDefault();
      if (locked) return;
      locked = true;

      var sections = getSections();
      var cur = currentIndex(sections);
      var dir = e.deltaY > 0 ? 1 : -1;
      var target = Math.max(0, Math.min(sections.length - 1, cur + dir));

      main.scrollTo({ top: sections[target].offsetTop, behavior: "smooth" });

      setTimeout(function () {
        locked = false;
      }, COOLDOWN);
    },
    { passive: false },
  );
})();
