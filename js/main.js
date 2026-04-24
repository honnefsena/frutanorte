(function () {
  "use strict";

  var nav = document.getElementById("site-nav");
  var toggle = document.querySelector(".nav-toggle");
  var navClose = nav ? nav.querySelector(".nav__close") : null;
  var navLinks = document.querySelectorAll('#site-nav a.nav__link[href^="#"]');

  function setBodyScrollLocked(locked) {
    document.body.style.overflow = locked ? "hidden" : "";
  }

  function closeNav() {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-label", "Abrir menu");
    setBodyScrollLocked(false);
  }

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
      setBodyScrollLocked(!open);
    });

    if (navClose) {
      navClose.addEventListener("click", function () {
        closeNav();
      });
    }

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (toggle.getAttribute("aria-expanded") !== "true") return;
        closeNav();
      });
    });
  }

  if (navLinks.length) {
    if (window.location.hash) {
      setActiveNavLink(window.location.hash);
    } else {
      setActiveNavLink("");
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
      else setActiveNavLink("");
    });
  }

  var sobreContent = document.getElementById("sobre-conteudo");
  var sobreNavLinks = document.querySelectorAll('.sobre__nav .sobre__nav-btn[href^="#"]');

  if (sobreContent && sobreNavLinks.length) {
    sobreNavLinks.forEach(function (link) {
      link.addEventListener("click", function (event) {
        var hash = link.getAttribute("href");
        if (!hash) return;

        var target = sobreContent.querySelector(hash);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });

        if (window.history && typeof window.history.replaceState === "function") {
          window.history.replaceState(null, "", hash);
        }
      });
    });
  }

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
