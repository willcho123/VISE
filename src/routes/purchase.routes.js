// src/routes/purchase.routes.js
const express = require("express");
const router = express.Router();

// Importar clientes registrados desde client.routes.js
const { clients } = require("./client.routes");

// Función para aplicar beneficios y restricciones
function processPurchase(client, { amount, currency, purchaseDate, purchaseCountry }) {
  const card = client.cardType;
  const date = new Date(purchaseDate);
  let discount = 0;
  let benefit = null;

  // 1. Restricciones para Black y White
  const restrictedCountries = ["China", "Vietnam", "India", "Irán"];
  if (["Black", "White"].includes(card) && restrictedCountries.includes(purchaseCountry)) {
    return { error: `El cliente con tarjeta ${card} no puede realizar compras desde ${purchaseCountry}` };
  }

  // 2. Beneficios según tarjeta
  // Ejemplo: Descuento del 30% en compras los sábados
  if (date.getUTCDay() === 6) { // 6 = Sábado en JS
    discount = amount * 0.30;
    benefit = "Sábado - Descuento 30%";
  }

  return {
    approved: true,
    purchase: {
      clientId: client.clientId,
      originalAmount: amount,
      discountApplied: discount,
      finalAmount: amount - discount,
      benefit
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
