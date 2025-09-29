const express = require("express");
const router = express.Router();

// Importar clientes registrados desde client.routes.js
const { clients } = require("./client.routes");

// Función para aplicar beneficios y restricciones
function processPurchase(client, { amount, currency, purchaseDate, purchaseCountry }) {
  const card = client.cardType;
  const date = new Date(purchaseDate);
  const day = date.getUTCDay(); // 0=Domingo ... 6=Sábado
  let discount = 0;
  let benefit = null;

  // ===== Restricciones =====
  const restrictedCountries = ["China", "Vietnam", "India", "Irán"];
  if (["Black", "White"].includes(card) && restrictedCountries.includes(purchaseCountry)) {
    return { error: `El cliente con tarjeta ${card} no puede realizar compras desde ${purchaseCountry}` };
  }

  // ===== Beneficios =====
  const isForeignPurchase = client.country !== purchaseCountry;

  switch (card) {
    case "Classic":
      // No tiene beneficios
      break;

    case "Gold":
      if ([1, 2, 3].includes(day) && amount > 100) { // Lun=1, Mar=2, Mié=3
        discount = amount * 0.15;
        benefit = "Lunes-Martes-Miércoles - Descuento 15%";
      }
      break;

    case "Platinum":
      if ([1, 2, 3].includes(day) && amount > 100) {
        discount = amount * 0.20;
        benefit = "Lunes-Martes-Miércoles - Descuento 20%";
      }
      if (day === 6 && amount > 200) { // Sábado
        discount = amount * 0.30;
        benefit = "Sábado - Descuento 30%";
      }
      if (isForeignPurchase) {
        discount += amount * 0.05;
        benefit = benefit ? `${benefit} + Exterior 5%` : "Exterior - Descuento 5%";
      }
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
      if (isForeignPurchase) {
        discount += amount * 0.05;
        benefit = benefit ? `${benefit} + Exterior 5%` : "Exterior - Descuento 5%";
      }
      break;

    case "White":
      if ([1, 2, 3, 4, 5].includes(day) && amount > 100) {
        discount = amount * 0.25;
        benefit = "Lunes a Viernes - Descuento 25%";
      }
      if ([0, 6].includes(day) && amount > 200) { // Sábado o Domingo
        discount = amount * 0.35;
        benefit = "Sábado-Domingo - Descuento 35%";
      }
      if (isForeignPurchase) {
        discount += amount * 0.05;
        benefit = benefit ? `${benefit} + Exterior 5%` : "Exterior - Descuento 5%";
      }
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
      benefit: benefit || "Sin beneficios aplicados"
    }
  };
}

// POST /purchase
router.post("/", (req, res) => {
  console.log("POST /purchase body:", req.body);

  const { clientId, amount, currency, purchaseDate, purchaseCountry } = req.body;

  if (!clientId || !amount || !currency || !purchaseDate || !purchaseCountry) {
    return res.status(400).json({
      status: "Rejected",
      error: "Faltan campos requeridos: clientId, amount, currency, purchaseDate, purchaseCountry"
    });
  }

  // Buscar cliente
  const client = clients.find(c => c.clientId === clientId);
  if (!client) {
    return res.status(404).json({
      status: "Rejected",
      error: "Cliente no encontrado"
    });
  }

  // Procesar compra
  const result = processPurchase(client, { amount, currency, purchaseDate, purchaseCountry });

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
