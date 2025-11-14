// In your instrumentation setup (instrumentation.js)
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require ('@opentelemetry/exporter-trace-otlp-proto');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
//const { Resource } = require ('@opentelemetry/resources');
//const {ATTR_SERVICE_NAME } = require ('@opentelemetry/semantic-conventions');

const traceExporter = new OTLPTraceExporter({
  url: 'https://api.axiom.co/v1/traces',
  headers: {
    'Authorization': 'Bearer xaat-a161c0d3-8030-462e-9c31-11497f3c853d',
    'X-Axiom-Dataset': 'vise'
  },
});


// Creating a resource to identify your service in traces
//const resource = new Resource({
//  [ATTR_SERVICE_NAME]: 'node traces',
//});



const sdk = new NodeSDK({
  // ... other configurations ...
  instrumentations: [getNodeAutoInstrumentations()],

    // Adding a BatchSpanProcessor to batch and send traces
  spanProcessor: new BatchSpanProcessor(traceExporter),

  // Registering the resource to the SDK
  //resource: resource,
});

// Starting the OpenTelemetry SDK to begin collecting telemetry data
sdk.start();