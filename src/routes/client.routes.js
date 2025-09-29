// src/routes/client.routes.js
const express = require("express");
const router = express.Router();

// Datos simulados en memoria
let clients = [];
let nextId = 1;

/**
 * Verifica las restricciones según tipo de tarjeta y datos del cliente
 * @param {Object} params
 * @param {string} params.country
 * @param {number} params.monthlyIncome
 * @param {boolean} params.viseClub
 * @param {string} params.cardType
 * @returns {string|null} Mensaje de error o null si es válido
 */
function checkRestrictions({ country, monthlyIncome, viseClub, cardType }) {
  const ct = String(cardType || "").trim();

  const restrictions = {
    Classic: () => null,
    Gold: () =>
      monthlyIncome < 500
        ? "Ingreso insuficiente para Gold"
        : null,
    Platinum: () => {
      if (monthlyIncome < 1000) return "Ingreso insuficiente para Platinum";
      if (!viseClub)
        return "El cliente no cumple con la suscripción VISE CLUB requerida para Platinum";
      return null;
    },
    Black: () => {
      if (monthlyIncome < 2000) return "Ingreso insuficiente para Black";
      if (!viseClub)
        return "El cliente no cumple con la suscripción VISE CLUB requerida para Black";
      if (["China", "Vietnam", "India", "Irán"].includes(country.trim())) {
        return "País restringido para esta tarjeta";
      }
      return null;
    },
    White: () => {
      if (monthlyIncome < 2000) return "Ingreso insuficiente para White";
      if (!viseClub)
        return "El cliente no cumple con la suscripción VISE CLUB requerida para White";
      if (["China", "Vietnam", "India", "Irán"].includes(country.trim())) {
        return "País restringido para esta tarjeta";
      }
      return null;
    }
  };

  return restrictions[ct] ? restrictions[ct]() : "Tipo de tarjeta inválido";
}

/**
 * Normaliza los valores recibidos en el body
 */
function normalizeInput({ monthlyIncome, viseClub, ...rest }) {
  let income = monthlyIncome;
  let club = viseClub;

  if (typeof income === "string") {
    const parsed = Number(income);
    if (!Number.isNaN(parsed)) income = parsed;
  }

  if (typeof club === "string") {
    club = club.toLowerCase() === "true";
  }

  return { monthlyIncome: income, viseClub: club, ...rest };
}

// POST /client
router.post("/", (req, res) => {
  console.log("POST /client body:", req.body);

  const { name, country, cardType } = req.body;
  let { monthlyIncome, viseClub } = normalizeInput(req.body);

  // Validar campos requeridos
  if (!name || !country || cardType === undefined || monthlyIncome === undefined || viseClub === undefined) {
    return res.status(400).json({
      status: "Rejected",
      error: "Faltan campos requeridos: name, country, monthlyIncome, viseClub, cardType"
    });
  }

  // Validaciones de tipo
  if (typeof monthlyIncome !== "number") {
    return res.status(400).json({
      status: "Rejected",
      error: "monthlyIncome debe ser un número"
    });
  }

  if (typeof viseClub !== "boolean") {
    return res.status(400).json({
      status: "Rejected",
      error: "viseClub debe ser boolean (true/false)"
    });
  }

  // Restricciones por tarjeta
  const error = checkRestrictions({ country, monthlyIncome, viseClub, cardType });
  if (error) {
    return res.status(400).json({ status: "Rejected", error });
  }

  // Crear cliente
  const client = {
    clientId: nextId++,
    name: String(name).trim(),
    country: String(country).trim(),
    monthlyIncome,
    viseClub,
    cardType: String(cardType).trim()
  };
  clients.push(client);

  return res.json({
    clientId: client.clientId,
    name: client.name,
    cardType: client.cardType,
    status: "Registered",
    message: Cliente apto para tarjeta ${client.cardType}
  });
});

// Exportamos tanto el router como los clientes en memoria
module.exports = { router, clients };