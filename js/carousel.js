(function () {
  "use strict";

  var root = document.querySelector("[data-carousel]");
  if (!root) return;

  var slides = root.querySelectorAll("[data-slide]");
  var prevBtn = root.querySelector("[data-carousel-prev]");
  var nextBtn = root.querySelector("[data-carousel-next]");
  var dotsContainer = root.querySelector("[data-carousel-dots]");
  var total = slides.length;
  var index = 0;
  var intervalId = null;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var autoplayMs = 6000;

  function goTo(i) {
    index = (i + total) % total;
    slides.forEach(function (slide, j) {
      var active = j === index;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
      slide.setAttribute("aria-label", String(j + 1) + " de " + String(total));
    });
    if (dotsContainer) {
      var dots = dotsContainer.querySelectorAll("button");
      dots.forEach(function (dot, j) {
        dot.setAttribute("aria-current", j === index ? "true" : "false");
      });
    }
  }

  function next() {
    goTo(index + 1);
  }

  function prev() {
    goTo(index - 1);
  }

  function stopAutoplay() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();
    if (reducedMotion || total < 2) return;
    intervalId = window.setInterval(next, autoplayMs);
  }

  if (dotsContainer && total > 0) {
    dotsContainer.innerHTML = "";
    for (var d = 0; d < total; d++) {
      (function (j) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "hero__dot";
        btn.setAttribute("aria-label", "Ir para slide " + String(j + 1));
        btn.addEventListener("click", function () {
          goTo(j);
          stopAutoplay();
          startAutoplay();
        });
        dotsContainer.appendChild(btn);
      })(d);
    }
  }

  if (prevBtn) prevBtn.addEventListener("click", function () {
    prev();
    stopAutoplay();
    startAutoplay();
  });
  if (nextBtn) nextBtn.addEventListener("click", function () {
    next();
    stopAutoplay();
    startAutoplay();
  });

  root.addEventListener("mouseenter", stopAutoplay);
  root.addEventListener("mouseleave", startAutoplay);
  root.addEventListener("focusin", stopAutoplay);
  root.addEventListener("focusout", function (e) {
    if (!root.contains(e.relatedTarget)) startAutoplay();
  });

  root.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
      stopAutoplay();
      startAutoplay();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
      stopAutoplay();
      startAutoplay();
    }
  });

  goTo(0);
  startAutoplay();
})();
