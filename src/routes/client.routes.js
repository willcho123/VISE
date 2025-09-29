// src/routes/client.routes.js
const express = require("express");
const Joi = require("joi");
const router = express.Router();

// ===================
// Datos simulados en memoria
// ===================
let clients = [];
let nextId = 1;

// ===================
// Constantes de negocio
// ===================
const RESTRICTED_COUNTRIES = ["China", "Vietnam", "India", "Irán"];
const CARD_TYPES = ["Classic", "Gold", "Platinum", "Black", "White"];

// ===================
// Validación con Joi
// ===================
const clientSchema = Joi.object({
  name: Joi.string().trim().required(),
  country: Joi.string().trim().required(),
  monthlyIncome: Joi.number().required(),
  viseClub: Joi.boolean().required(),
  cardType: Joi.string().valid(...CARD_TYPES).required()
});

// ===================
// Lógica de restricciones
// ===================
function checkRestrictions({ country, monthlyIncome, viseClub, cardType }) {
  switch (cardType) {
    case "Classic":
      return null;

    case "Gold":
      return monthlyIncome < 500 ? "Ingreso insuficiente para Gold" : null;

    case "Platinum":
      if (monthlyIncome < 1000) return "Ingreso insuficiente para Platinum";
      if (!viseClub) return "Debe estar suscrito a VISE CLUB para Platinum";
      return null;

    case "Black":
    case "White":
      if (monthlyIncome < 2000) return `Ingreso insuficiente para ${cardType}`;
      if (!viseClub) return `Debe estar suscrito a VISE CLUB para ${cardType}`;
      if (RESTRICTED_COUNTRIES.includes(country)) {
        return "País restringido para esta tarjeta";
      }
      return null;

    default:
      return "Tipo de tarjeta inválido";
  }
}

// ===================
// Rutas
// ===================

// POST /client - Registrar cliente
router.post("/", (req, res) => {
  console.log("POST /client body:", req.body);

  // Validar entrada con Joi
  const { error, value } = clientSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      status: "Rejected",
      error: error.details[0].message
    });
  }

  const { name, country, monthlyIncome, viseClub, cardType } = value;

  // Validar restricciones de negocio
  const restrictionError = checkRestrictions(value);
  if (restrictionError) {
    return res.status(400).json({
      success: false,
      status: "Rejected",
      error: restrictionError
    });
  }

  // Crear cliente
  const client = {
    clientId: nextId++,
    name,
    country,
    monthlyIncome,
    viseClub,
    cardType
  };
  clients.push(client);

  return res.json({
    success: true,
    status: "Registered",
    data: {
      clientId: client.clientId,
      name: client.name,
      cardType: client.cardType
    },
    message: `Cliente apto para tarjeta ${client.cardType}`
  });
});

// GET /clients - Listar clientes
router.get("/", (req, res) => {
  return res.json({
    success: true,
    total: clients.length,
    clients
  });
});

// ===================
// Exportación
// ===================
module.exports = { router, clients };
