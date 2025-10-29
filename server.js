import appInsights from "applicationinsights";

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

// Escucha en puerto 443 (tu requerimiento)
app.listen(443, "0.0.0.0", () => console.log("VISE API running on port 443"));

// Initialize using the connection string injected by Azure
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
client.context.tags[client.context.keys.cloudRole] = "my-node-api";

client.trackEvent({
  name: "server_started",
  properties: { environment: "production" },
});
