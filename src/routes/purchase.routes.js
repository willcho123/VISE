// src/routes/purchase.routes.js
const express = require("express");
const router = express.Router();

// Importar clientes registrados desde client.routes.js
const { clients } = require("./client.routes");

// Lista de países restringidos
const RESTRICTED_COUNTRIES = ["China", "Vietnam", "India", "Irán"];

/**
 * Procesa una compra aplicando beneficios y restricciones
 * @param {Object} client - Cliente que realiza la compra
 * @param {Object} purchase - Datos de la compra
 * @param {number} purchase.amount
 * @param {string} purchase.currency
 * @param {string|Date} purchase.purchaseDate
 * @param {string} purchase.purchaseCountry
 * @returns {Object} Resultado de la compra (aprobada o error)
 */
function processPurchase(client, { amount, currency, purchaseDate, purchaseCountry }) {
  const card = client.cardType;
  const date = new Date(purchaseDate);
  const day = date.getUTCDay(); // 0=Domingo ... 6=Sábado
  let discount = 0;
  let benefit = null;

  // ===== Restricciones =====
  if (["Black", "White"].includes(card) && RESTRICTED_COUNTRIES.includes(purchaseCountry)) {
    return { error: `El cliente con tarjeta ${card} no puede realizar compras desde ${purchaseCountry}` };
  }

  // ===== Beneficios =====
  const isForeignPurchase = client.country !== purchaseCountry;

  const applyForeignBenefit = () => {
    discount += amount * 0.05;
    benefit = benefit ? `${benefit} + Exterior 5%` : "Exterior - Descuento 5%";
  };

  switch (card) {
    case "Classic":
      // No tiene beneficios
      break;

    case "Gold":
      if ([1, 2, 3].includes(day) && amount > 100) {
        discount = amount * 0.15;
        benefit = "Lunes-Martes-Miércoles - Descuento 15%";
      }
      break;

    case "Platinum":
      if ([1, 2, 3].includes(day) && amount > 100) {
        discount = amount * 0.20;
        benefit = "Lunes-Martes-Miércoles - Descuento 20%";
      }
      if (day === 6 && amount > 200) {
        discount = amount * 0.30;
        benefit = "Sábado - Descuento 30%";
      }
      if (isForeignPurchase) applyForeignBenefit();
      break;

    case "Black":
      if ([1, 2, 3].includes(day) && amount > 100) {
        discount = amount * 0.25;
        benefit = "Lunes-Martes-Miércoles - Descuento 25%";
      }
      if (day === 6 && amount > 200) {
        discount = amount * 0.35;
        benefit = "Sábado - Descuento 35%";
      }
      if (isForeignPurchase) applyForeignBenefit();
      break;

    case "White":
      if ([1, 2, 3, 4, 5].includes(day) && amount > 100) {
        discount = amount * 0.25;
        benefit = "Lunes a Viernes - Descuento 25%";
      }
      if ([0, 6].includes(day) && amount > 200) {
        discount = amount * 0.35;
        benefit = "Sábado-Domingo - Descuento 35%";
      }
      if (isForeignPurchase) applyForeignBenefit();
      break;

    default:
      break;
  }

  return {
    approved: true,
    purchase: {
      clientId: client.clientId,
      originalAmount: amount,
      discountApplied: discount,
      finalAmount: amount - discount,
      currency,
      benefit: benefit || "Sin beneficios aplicados"
    }
  };
}

// POST /purchase
router.post("/", (req, res) => {
  console.log("POST /purchase body:", req.body);

  const { clientId, amount, currency, purchaseDate, purchaseCountry } = req.body;

  // Validación de campos requeridos
  if (!clientId || !amount || !currency || !purchaseDate || !purchaseCountry) {
    return res.status(400).json({
      status: "Rejected",
      error: "Faltan campos requeridos: clientId, amount, currency, purchaseDate, purchaseCountry"
    });
  }

  // Validación de cliente
  const client = clients.find(c => c.clientId === Number(clientId));
  if (!client) {
    return res.status(404).json({
      status: "Rejected",
      error: "Cliente no encontrado"
    });
  }

  // Procesar compra
  const result = processPurchase(client, { amount: Number(amount), currency, purchaseDate, purchaseCountry });

  if (result.error) {
    return res.status(400).json({
      status: "Rejected",
      error: result.error
    });
  }

  return res.json({
    status: "Approved",
    purchase: result.purchase
  });
});

module.exports = router;
