"use strict";

const express = require("express");
const path = require("path");
const { loadConfig } = require("./config");
const { sendContactEmail, SUBJECT_LABELS } = require("./send-email");

let config;
try {
  config = loadConfig();
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: "32kb" }));

const rateState = new Map();
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 8;

function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;
  if (origin && config.allowedOrigins.some((o) => origin === o || origin.startsWith(o))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  } else if (origin && config.allowedOrigins.includes("*")) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
}

app.use(corsMiddleware);

function clientIp(req) {
  return req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
}

function rateLimit(ip) {
  const now = Date.now();
  let row = rateState.get(ip);
  if (!row || now > row.resetAt) {
    row = { count: 0, resetAt: now + RATE_WINDOW_MS };
    rateState.set(ip, row);
  }
  row.count += 1;
  return row.count <= RATE_MAX;
}

function sanitize(str, max) {
  if (str == null) return "";
  const s = String(str).trim();
  return s.length > max ? s.slice(0, max) : s;
}

function validateBody(body) {
  const errors = [];
  const name = sanitize(body.name, 120);
  const email = sanitize(body.email, 254);
  const phone = sanitize(body.phone, 40);
  const address = sanitize(body.address, 200);
  const city = sanitize(body.city, 80);
  const state = sanitize(body.state, 80);
  const subject = sanitize(body.subject, 80);
  const message = sanitize(body.message, 4000);

  if (name.length < 2) errors.push("nome inválido");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("e-mail inválido");
  if (address.length < 2) errors.push("endereço inválido");
  if (city.length < 2) errors.push("cidade inválida");
  if (state.length < 2) errors.push("estado inválido");
  if (!SUBJECT_LABELS[subject]) errors.push("assunto inválido");
  if (message.length < 10) errors.push("mensagem muito curta");

  return {
    ok: errors.length === 0,
    errors,
    data: {
      name,
      email,
      phone: phone || undefined,
      address,
      city,
      state,
      subject,
      message,
    },
  };
}

app.post("/api/contact", async (req, res) => {
  if (req.body && req.body.website && String(req.body.website).trim()) {
    return res.json({ success: true });
  }

  const ip = clientIp(req);
  if (!rateLimit(ip)) {
    return res.status(429).json({ success: false, message: "Muitas tentativas. Aguarde um minuto." });
  }

  const v = validateBody(req.body || {});
  if (!v.ok) {
    return res.status(400).json({ success: false, message: v.errors.join(" ") });
  }

  try {
    await sendContactEmail(v.data, config);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Falha ao enviar. Tente mais tarde." });
  }
});

app.use(express.static(path.join(__dirname, "..")));

app.listen(config.port, () => {
  console.log(`Fruta Norte API em http://localhost:${config.port} (POST /api/contact)`);
});
