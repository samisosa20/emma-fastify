import Fastify from "fastify";
import path from "path";
import fastifyJwt from "@fastify/jwt";
import autoload from "@fastify/autoload";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

import { swaggerOptions, swaggerUiOptions } from "./settings/swagger";
import { registerDecorators } from "./middleware";

// Import Jobs
import "./jobs/insertMovements.jobs";

// Start the server
const bootstrap = async () => {
  const fastify = Fastify({ logger: true, disableRequestLogging: true });
  try {
    await registerDecorators(fastify);

    // Register plugins
    fastify.register(autoload, {
      dir: path.join(__dirname, "plugins"),
    });
    // Decorate

    fastify.register(swagger, swaggerOptions);

    fastify.register(swaggerUi, swaggerUiOptions);

    // Register routes
    fastify.register(autoload, {
      dir: path.join(__dirname, "routes"),
      options: { prefix: "/api/v2" },
    });

    fastify.register(cors, {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: "*",
    });

    fastify.register(rateLimit, {
      max: 10,
      timeWindow: "1 minute",
    });
    await fastify.after();
    fastify.register(fastifyJwt, {
      secret: process.env.JWT_SECRET || "supersecretkey",
    });
    await fastify.listen({
      port: Number(process.env.PORT) || 3000,
      host: "0.0.0.0",
    });
    console.log(
      `Server is running on http://localhost::${process.env.PORT || 3000}`
    );
    fastify.swagger();
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

bootstrap();
