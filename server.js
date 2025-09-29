// server.js
const express = require("express");

const app = express();

// Middleware
app.use(express.json()); // Ya no necesitas body-parser, Express lo trae integrado desde la v4.16

// Importar rutas de clientes
const clientRoutes = require("./src/routes/client.routes");
app.use("/client", clientRoutes);

// Importar rutas de compras
const purchaseRoutes = require("./src/routes/purchase.routes");
app.use("/purchase", purchaseRoutes);

// Configuración del puerto
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`VISE API running on port ${PORT}`);
});
