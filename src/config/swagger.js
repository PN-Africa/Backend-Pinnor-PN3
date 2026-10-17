import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { fileURLToPath } from "node:url";
import path from "node:path";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

// Resolve path and ensure forward slashes for glob matching across OS platforms
const routesPath = path
  .resolve(currentDirectory, "../routes/**/*.js")
  .replace(/\\/g, "/");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Pinnor Health API",
      version: "1.0.0",
      description:
        "REST API for the Pinnor Health appointment booking platform",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    tags: [
      { name: "Providers", description: "Provider management" },
      { name: "Services", description: "Healthcare service management" },
      { name: "Availability", description: "Provider availability management" },
      { name: "Bookings", description: "Guest appointment booking" },
      {
        name: "Appointments",
        description:
          "Appointment management, including cancellation and completion",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [routesPath],
};

const swaggerSpec = swaggerJsdoc(options);

console.log("Swagger paths found:", Object.keys(swaggerSpec.paths || {}));

export const setupSwagger = (app) => {
  // Serve raw JSON spec
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  // Serve Swagger UI
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
  );
};