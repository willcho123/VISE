import appInsights from "applicationinsights";
import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

// Importar rutas de clientes
import { router as clientRoutes } from "./src/routes/client.routes.js";
app.use("/client", clientRoutes);

// Importar rutas de compras
import purchaseRoutes from "./src/routes/purchase.routes.js";
app.use("/purchase", purchaseRoutes);

// 🔹 Puerto compatible (Azure usa process.env.PORT)
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ VISE API running on port ${PORT}`);
});

// 🔹 Application Insights (solo si la variable existe)
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
  client.context.tags[client.context.keys.cloudRole] = "my-node-api";
  client.trackEvent({
    name: "server_started",
    properties: { environment: "production" },
  });
}
