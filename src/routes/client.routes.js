// src/routes/client.routes.js
const express = require("express");
const router = express.Router();

let clients = [];
let nextId = 1;

function checkRestrictions({ country, monthlyIncome, viseClub, cardType }) {
  const ct = String(cardType || "").trim();

  switch (ct) {
    case "Classic":
      return null;
    case "Gold":
      if (typeof monthlyIncome !== "number" || monthlyIncome < 500) {
        return "Ingreso insuficiente para Gold";
      }
      return null;
    case "Platinum":
      if (typeof monthlyIncome !== "number" || monthlyIncome < 1000) {
        return "Ingreso insuficiente para Platinum";
      }
      if (!viseClub) {
        return "El cliente no cumple con la suscripción VISE CLUB requerida para Platinum";
      }
      return null;
    case "Black":
    case "White":
      if (typeof monthlyIncome !== "number" || monthlyIncome < 2000) {
        return "Ingreso insuficiente para " + ct;
      }
      if (!viseClub) {
        return `El cliente no cumple con la suscripción VISE CLUB requerida para ${ct}`;
      }
      if (["China", "Vietnam", "India", "Irán"].includes(String(country).trim())) {
        return "País restringido para esta tarjeta";
      }
      return null;
    default:
      return "Tipo de tarjeta inválido";
  }
}

// POST /client
router.post("/", (req, res) => {
  console.log("POST /client body:", req.body);

  const { name, country } = req.body;
  let { monthlyIncome, viseClub, cardType } = req.body;

  if (!name || !country || cardType === undefined || monthlyIncome === undefined || viseClub === undefined) {
    return res.status(400).json({
      status: "Rejected",
      error: "Faltan campos requeridos: name, country, monthlyIncome, viseClub, cardType"
    });
  }

  // Normalizar tipos
  if (typeof monthlyIncome === "string") {
    const num = Number(monthlyIncome);
    monthlyIncome = Number.isNaN(num) ? monthlyIncome : num;
  }
  if (typeof viseClub === "string") {
    viseClub = viseClub.toLowerCase() === "true";
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

  // Restricciones
  const error = checkRestrictions({ country, monthlyIncome, viseClub, cardType });
  if (error) {
    return res.status(400).json({
      status: "Rejected",
      error
    });
  }

  // Registrar cliente
  const client = {
    clientId: nextId++,
    name: String(name),
    country: String(country),
    monthlyIncome,
    viseClub,
    cardType: String(cardType)
  };
  clients.push(client);

  return res.json({
    clientId: client.clientId,
    name: client.name,
    cardType: client.cardType,
    status: "Registered",
    message: `Cliente apto para tarjeta ${client.cardType}`
  });
});

// Exportamos tanto el router como los clientes
module.exports = { router, clients };
