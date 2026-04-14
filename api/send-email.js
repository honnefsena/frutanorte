"use strict";

const sgMail = require("@sendgrid/mail");

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const SUBJECT_LABELS = {
  comercial: "Comercial / revenda",
  parceria: "Parceria / eventos",
  qualidade: "Qualidade / documentação",
  outro: "Outro",
};

/**
 * @param {object} payload - { name, email, phone?, subject, message }
 * @param {object} config - from loadConfig()
 */
async function sendContactEmail(payload, config) {
  sgMail.setApiKey(config.sendgridApiKey);

  const subjectKey = payload.subject || "outro";
  const subjectLine = `[Fruta Norte] Contato: ${SUBJECT_LABELS[subjectKey] || subjectKey}`;

  const text = [
    `Nome: ${payload.name}`,
    `E-mail: ${payload.email}`,
    payload.phone ? `Telefone: ${payload.phone}` : null,
    `Assunto: ${SUBJECT_LABELS[subjectKey] || subjectKey}`,
    "",
    payload.message,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <p><strong>Nome:</strong> ${escapeHtml(payload.name)}</p>
    <p><strong>E-mail:</strong> ${escapeHtml(payload.email)}</p>
    ${payload.phone ? `<p><strong>Telefone:</strong> ${escapeHtml(payload.phone)}</p>` : ""}
    <p><strong>Assunto:</strong> ${escapeHtml(SUBJECT_LABELS[subjectKey] || subjectKey)}</p>
    <hr />
    <pre style="font-family: sans-serif; white-space: pre-wrap;">${escapeHtml(payload.message)}</pre>
  `;

  const msg = {
    to: config.toEmail,
    from: config.fromEmail,
    replyTo: payload.email,
    subject: subjectLine,
    text,
    html,
  };

  await sgMail.send(msg);
}

module.exports = { sendContactEmail, SUBJECT_LABELS };
