import { Hono } from "hono";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const swagger = new Hono();

// Load the OpenAPI spec once at startup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const specPath = resolve(__dirname, "../swagger/openapi.json");
const spec = JSON.parse(readFileSync(specPath, "utf-8"));

// JSON endpoint — raw OpenAPI spec
swagger.get("/json", (c) => {
  return c.json(spec);
});

// Swagger UI — self-contained CDN-based HTML page
swagger.get("/", (c) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vocation API — Swagger</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; }
    .swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/api/docs/json',
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.SwaggerUIStandalonePreset
      ],
      layout: 'BaseLayout',
    });
  </script>
</body>
</html>`;

  return c.html(html);
});

export default swagger;
