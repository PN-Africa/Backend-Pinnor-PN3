
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { fileURLToPath } from "node:url";
import path from "node:path";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

// Resolve route paths across Windows and Linux
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
        "REST API for the Pinnor Health appointment booking platform"
    },

    servers: [
      {
        url: "https://backend-pinnor-pn3.onrender.com",
        description: "Production server"
      },
      {
        url: "http://localhost:5000",
        description: "Development server"
      }
    ],

    tags: [
      {
        name: "Authentication",
        description:
          "User registration, email/password login, signup OTP verification, Google OAuth sign-in through Supabase, and authentication management. Google Sign-In is initiated by the frontend using the Supabase client. Protected API endpoints use the Supabase access token as a Bearer JWT."
      },
      {
        name: "Providers",
        description: "Provider management"
      },
      {
        name: "Services",
        description: "Healthcare service management"
      },
      {
        name: "Availability",
        description: "Provider availability management"
      },
      {
        name: "Bookings",
        description: "Guest appointment booking"
      },
      {
        name: "Appointments",
        description:
          "Appointment management, including cancellation and completion"
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },

  apis: [routesPath]
};

const swaggerSpec = swaggerJsdoc(options);

console.log(
  "Swagger paths found:",
  Object.keys(swaggerSpec.paths || {})
);

console.log(
  "Cancellation parameters:",
  JSON.stringify(
    {
      admin:
        swaggerSpec.paths?.["/api/appointments/{id}/cancel"]?.patch
          ?.parameters,

      patient:
        swaggerSpec.paths?.["/api/appointments/{id}/my-cancel"]?.patch
          ?.parameters
    },
    null,
    2
  )
);

console.log(
  "Guest cancellation request body:",
  JSON.stringify(
    swaggerSpec.paths?.["/api/bookings/cancel"]?.patch?.requestBody,
    null,
    2
  )
);

export const setupSwagger = (app) => {
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
  );
};
