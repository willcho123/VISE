// server.js
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Importar rutas de clientes
const { router: clientRoutes } = require("./src/routes/client.routes");
app.use("/client", clientRoutes);

// Importar rutas de compras
const purchaseRoutes = require("./src/routes/purchase.routes");
app.use("/purchase", purchaseRoutes);

app.listen(4000, () => console.log("VISE API running on port 4000"));
