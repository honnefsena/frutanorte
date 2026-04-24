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

  var produtoModal = document.getElementById("produto-modal");
  var produtoModalContent = produtoModal ? produtoModal.querySelector(".produto-modal__content") : null;
  var produtoModalTitle = produtoModal ? produtoModal.querySelector(".produto-modal__title") : null;
  var produtoModalButtons = document.querySelectorAll(".produto-card__button[data-product-id]");
  var produtoModalCloseButtons = produtoModal ? produtoModal.querySelectorAll("[data-close-modal]") : [];
  var produtoModalLastTrigger = null;

  var produtoNutricaoPorId = {
    1: { porcao: "100g", calorias: "118 kcal", carboidratos: "21 g", acucares: "16 g", proteinas: "1.8 g", gorduras: "2.2 g", fibras: "3.6 g", sodio: "18 mg" },
    2: { porcao: "100g", calorias: "121 kcal", carboidratos: "22 g", acucares: "16.5 g", proteinas: "1.9 g", gorduras: "2.4 g", fibras: "3.5 g", sodio: "20 mg" },
    3: { porcao: "100g", calorias: "116 kcal", carboidratos: "20 g", acucares: "15.1 g", proteinas: "1.7 g", gorduras: "2.1 g", fibras: "3.8 g", sodio: "17 mg" },
    4: { porcao: "100g", calorias: "124 kcal", carboidratos: "22.5 g", acucares: "17 g", proteinas: "2.0 g", gorduras: "2.5 g", fibras: "3.4 g", sodio: "22 mg" },
    5: { porcao: "100g", calorias: "113 kcal", carboidratos: "19.7 g", acucares: "14.8 g", proteinas: "1.6 g", gorduras: "2.0 g", fibras: "3.9 g", sodio: "16 mg" },
    6: { porcao: "100g", calorias: "119 kcal", carboidratos: "21.2 g", acucares: "15.9 g", proteinas: "1.8 g", gorduras: "2.2 g", fibras: "3.7 g", sodio: "19 mg" },
    7: { porcao: "100g", calorias: "126 kcal", carboidratos: "23.1 g", acucares: "17.3 g", proteinas: "2.1 g", gorduras: "2.6 g", fibras: "3.3 g", sodio: "23 mg" },
    8: { porcao: "100g", calorias: "117 kcal", carboidratos: "20.6 g", acucares: "15.2 g", proteinas: "1.7 g", gorduras: "2.1 g", fibras: "3.8 g", sodio: "18 mg" },
    9: { porcao: "100g", calorias: "122 kcal", carboidratos: "22.1 g", acucares: "16.6 g", proteinas: "1.9 g", gorduras: "2.4 g", fibras: "3.5 g", sodio: "21 mg" },
    10: { porcao: "100g", calorias: "114 kcal", carboidratos: "20.1 g", acucares: "15 g", proteinas: "1.6 g", gorduras: "2.0 g", fibras: "3.9 g", sodio: "17 mg" },
    11: { porcao: "100g", calorias: "127 kcal", carboidratos: "23.4 g", acucares: "17.8 g", proteinas: "2.1 g", gorduras: "2.7 g", fibras: "3.2 g", sodio: "24 mg" },
    12: { porcao: "100g", calorias: "115 kcal", carboidratos: "20.4 g", acucares: "15.3 g", proteinas: "1.7 g", gorduras: "2.1 g", fibras: "3.8 g", sodio: "18 mg" },
    13: { porcao: "100g", calorias: "123 kcal", carboidratos: "22.7 g", acucares: "16.9 g", proteinas: "2.0 g", gorduras: "2.5 g", fibras: "3.4 g", sodio: "22 mg" }
  };

  function renderProdutoTabelaHtml(dados) {
    return (
      '<p>Porção: ' + dados.porcao + '</p>' +
      '<table class="produto-modal__table">' +
      "<thead><tr><th>Nutriente</th><th>Quantidade</th></tr></thead>" +
      "<tbody>" +
      "<tr><td>Valor energético</td><td>" + dados.calorias + "</td></tr>" +
      "<tr><td>Carboidratos</td><td>" + dados.carboidratos + "</td></tr>" +
      "<tr><td>Açúcares</td><td>" + dados.acucares + "</td></tr>" +
      "<tr><td>Proteínas</td><td>" + dados.proteinas + "</td></tr>" +
      "<tr><td>Gorduras totais</td><td>" + dados.gorduras + "</td></tr>" +
      "<tr><td>Fibras alimentares</td><td>" + dados.fibras + "</td></tr>" +
      "<tr><td>Sódio</td><td>" + dados.sodio + "</td></tr>" +
      "</tbody>" +
      "</table>"
    );
  }

  function closeProdutoModal() {
    if (!produtoModal) return;
    produtoModal.classList.remove("is-open");
    produtoModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    if (produtoModalLastTrigger && typeof produtoModalLastTrigger.focus === "function") {
      produtoModalLastTrigger.focus();
    }
  }

  function openProdutoModal(productId, trigger) {
    if (!produtoModal || !produtoModalContent || !produtoModalTitle) return;
    var dados = produtoNutricaoPorId[productId];
    if (!dados) return;

    produtoModalLastTrigger = trigger || null;
    produtoModalTitle.textContent = "Tabela nutricional do produto " + productId;
    produtoModalContent.innerHTML = renderProdutoTabelaHtml(dados);
    produtoModal.classList.add("is-open");
    produtoModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  if (produtoModal && produtoModalButtons.length) {
    produtoModalButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var productId = Number(button.getAttribute("data-product-id"));
        openProdutoModal(productId, button);
      });
    });

    produtoModalCloseButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        closeProdutoModal();
      });
    });

    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && produtoModal.classList.contains("is-open")) {
        closeProdutoModal();
      }
    });
  }

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
