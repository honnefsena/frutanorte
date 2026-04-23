(function () {
  "use strict";

  var nav = document.getElementById("site-nav");
  var toggle = document.querySelector(".nav-toggle");
  var navLinks = document.querySelectorAll('.nav__link[href^="#"]');

  function setActiveNavLink(hash) {
    navLinks.forEach(function (link) {
      var isActive = link.getAttribute("href") === hash;
      link.classList.toggle("nav__link--active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
      toggle.setAttribute("aria-label", open ? "Abrir menu" : "Fechar menu");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (toggle.getAttribute("aria-expanded") !== "true") return;
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-label", "Abrir menu");
      });
    });
  }

  if (navLinks.length) {
    if (window.location.hash) {
      setActiveNavLink(window.location.hash);
    } else {
      setActiveNavLink("#inicio");
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          setActiveNavLink("#" + entry.target.id);
        });
      },
      {
        root: null,
        rootMargin: "-40% 0px -45% 0px",
        threshold: 0.01
      }
    );

    navLinks.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      var target = document.getElementById(id);
      if (target) observer.observe(target);
    });

    window.addEventListener("hashchange", function () {
      if (window.location.hash) setActiveNavLink(window.location.hash);
    });
  }

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
