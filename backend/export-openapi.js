// Generates docs/api/openapi.json from the live Swagger spec.
// Run with: node export-openapi.js

const fs = require('fs');
const path = require('path');
const swaggerSpec = require('./src/config/swagger');

const outDir = path.join(__dirname, '..', 'docs', 'api');
const outFile = path.join(outDir, 'openapi.json');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(outFile, JSON.stringify(swaggerSpec, null, 2), 'utf8');
console.log(`OpenAPI spec written to ${outFile}`);
