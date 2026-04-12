(function () {
  var COOLDOWN = 1000;
  var locked = false;
  var main = document.querySelector("main");
  var snapDisabled = false;

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

  function sectionOverflows(section) {
    return section.offsetHeight > main.clientHeight + 2;
  }

  function atSectionBottom(section) {
    return main.scrollTop + main.clientHeight >= section.offsetTop + section.offsetHeight - 2;
  }

  function atSectionTop(section) {
    return main.scrollTop <= section.offsetTop + 2;
  }

  function disableSnap() {
    if (!snapDisabled) {
      main.style.scrollSnapType = "none";
      snapDisabled = true;
    }
  }

  function enableSnap() {
    if (snapDisabled) {
      main.style.scrollSnapType = "y mandatory";
      snapDisabled = false;
    }
  }

  function snapTo(sections, target) {
    locked = true;
    enableSnap();
    main.scrollTo({ top: sections[target].offsetTop, behavior: "smooth" });
    setTimeout(function () {
      locked = false;
    }, COOLDOWN);
  }

  window.addEventListener(
    "wheel",
    function (e) {
      if (locked) {
        e.preventDefault();
        return;
      }

      var sections = getSections();
      var cur = currentIndex(sections);
      var section = sections[cur];
      var dir = e.deltaY > 0 ? 1 : -1;

      if (sectionOverflows(section)) {
        var goingDown = dir > 0;
        var goingUp = dir < 0;

        if (goingDown && atSectionBottom(section)) {
          e.preventDefault();
          var target = Math.min(sections.length - 1, cur + 1);
          if (target !== cur) snapTo(sections, target);
          return;
        }

        if (goingUp && atSectionTop(section)) {
          e.preventDefault();
          var target = Math.max(0, cur - 1);
          if (target !== cur) snapTo(sections, target);
          return;
        }

        disableSnap();
        return;
      }

      e.preventDefault();
      var target = Math.max(0, Math.min(sections.length - 1, cur + dir));
      snapTo(sections, target);
    },
    { passive: false },
  );
})();
