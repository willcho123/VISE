// server.js
const appInsights = require("applicationinsights");
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

// 🔹 Compatibilidad Azure + Local
// Azure asigna automáticamente process.env.PORT
<<<<<<< HEAD
const PORT = process.env.PORT || 443;
=======
const PORT = process.env.PORT || 4000;
>>>>>>> 5a0c2fb8c1f5c31df969a33a9c084973e7c03c4b

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ VISE API running on port ${PORT}`);
});

// 🔹 Application Insights para Azure Monitor
if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  appInsights
    .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true, true)
    .setUseDiskRetryCaching(true)
    .start();

  const client = appInsights.defaultClient;
  client.context.tags[client.context.keys.cloudRole] = "vise-api";

  client.trackEvent({
    name: "server_started",
    properties: { environment: process.env.NODE_ENV || "development" },
  });

  console.log("🟢 Application Insights initialized");
} else {
  console.log("⚠️ Application Insights not configured (no connection string found)");
}
