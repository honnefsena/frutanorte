(function () {
  "use strict";

  /**
   * Porta 3000: usa /api/contact (Express).
   * Caso contrário: data-contact-endpoint no <form>, senão api/send-email.php.
   */
  var form = document.getElementById("contact-form");
  if (!form) return;

  var submitBtn = document.getElementById("contact-submit");
  var boxOk = document.getElementById("form-success");
  var boxErr = document.getElementById("form-error");

  function endpoint() {
    if (window.location.port === "3000") return "/api/contact";
    var attr = form.getAttribute("data-contact-endpoint");
    if (attr && attr.trim()) return attr.trim();
    return "api/send-email.php";
  }

  function hideStatus() {
    boxOk.classList.remove("is-visible");
    boxErr.classList.remove("is-visible");
    boxOk.textContent = "";
    boxErr.textContent = "";
  }

  function showSuccess(msg) {
    boxErr.classList.remove("is-visible");
    boxOk.textContent = msg;
    boxOk.classList.add("is-visible");
  }

  function showError(msg) {
    boxOk.classList.remove("is-visible");
    boxErr.textContent = msg;
    boxErr.classList.add("is-visible");
  }

  function clearFieldErrors() {
    form.querySelectorAll(".form__error").forEach(function (el) {
      el.hidden = true;
      el.textContent = "";
    });
  }

  function setFieldError(id, message) {
    var el = document.getElementById(id);
    if (el) {
      el.textContent = message;
      el.hidden = false;
    }
  }

  function trim(str) {
    return (str || "").trim();
  }

  function validate(data) {
    var ok = true;
    if (!data.name || data.name.length < 2) {
      setFieldError("err-name", "Informe seu nome (mínimo 2 caracteres).");
      ok = false;
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setFieldError("err-email", "Informe um e-mail válido.");
      ok = false;
    }
    if (data.phone && data.phone.length > 40) {
      setFieldError("err-phone", "Telefone muito longo.");
      ok = false;
    }
    if (!data.subject) {
      setFieldError("err-subject", "Selecione um assunto.");
      ok = false;
    }
    if (!data.message || data.message.length < 10) {
      setFieldError("err-message", "Escreva uma mensagem (mínimo 10 caracteres).");
      ok = false;
    }
    if (!data.consent) {
      setFieldError("err-consent", "É necessário aceitar o tratamento dos dados para continuar.");
      ok = false;
    }
    return ok;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    hideStatus();
    clearFieldErrors();

    var fd = new FormData(form);
    var payload = {
      name: trim(fd.get("name")),
      email: trim(fd.get("email")),
      phone: trim(fd.get("phone")),
      subject: trim(fd.get("subject")),
      message: trim(fd.get("message")),
      website: trim(fd.get("website")),
      consent: fd.get("consent") === "1",
    };

    if (payload.website) {
      showSuccess("Mensagem enviada. Obrigado!");
      form.reset();
      return;
    }

    if (!validate(payload)) {
      showError("Corrija os campos destacados e tente novamente.");
      return;
    }

    submitBtn.disabled = true;
    var prevLabel = submitBtn.textContent;
    submitBtn.textContent = "Enviando…";

    fetch(endpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        phone: payload.phone || undefined,
        subject: payload.subject,
        message: payload.message,
      }),
    })
      .then(function (res) {
        return res.text().then(function (text) {
          var body = {};
          try {
            body = text ? JSON.parse(text) : {};
          } catch (ignore) {
            body = {};
          }
          return { ok: res.ok, status: res.status, body: body };
        });
      })
      .then(function (r) {
        if (r.ok && r.body && r.body.success) {
          showSuccess("Recebemos sua mensagem! Em breve retornamos o contato.");
          form.reset();
        } else {
          var msg =
            (r.body && r.body.message) ||
            "Não foi possível enviar agora. Tente novamente ou use o e-mail ou WhatsApp.";
          showError(msg);
        }
      })
      .catch(function () {
        showError("Erro de conexão. Verifique sua internet ou tente mais tarde.");
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = prevLabel;
      });
  });
})();
