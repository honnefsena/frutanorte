"use strict";

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

function required(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return String(v).trim();
}

function optional(name, fallback) {
  const v = process.env[name];
  if (v == null || !String(v).trim()) return fallback;
  return String(v).trim();
}

function loadConfig() {
  return {
    port: parseInt(optional("PORT", "3000"), 10) || 3000,
    sendgridApiKey: required("SENDGRID_API_KEY"),
    fromEmail: required("FROM_EMAIL"),
    toEmail: required("TO_EMAIL"),
    allowedOrigins: optional("ALLOWED_ORIGINS", "http://localhost")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

module.exports = { loadConfig };
