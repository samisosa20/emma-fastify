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
  // Security: Enforce required environment variables at startup
  const requiredEnv = ["JWT_SECRET", "BETTER_AUTH_SECRET", "APP_URL"];
  for (const env of requiredEnv) {
    if (!process.env[env]) {
      throw new Error(`Environment variable ${env} is not defined`);
    }
  }

  const fastify = Fastify({ logger: true, disableRequestLogging: true });

  // Security Headers: Implement standard protection against common web attacks.
  fastify.addHook("onSend", async (_request, reply, _payload) => {
    reply.header("X-Content-Type-Options", "nosniff");
    reply.header("X-Frame-Options", "DENY");
    reply.header("X-XSS-Protection", "1; mode=block");
    reply.header(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
    reply.header("Content-Security-Policy", "default-src 'self'");
    reply.header("Referrer-Policy", "no-referrer");
    reply.header(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=()"
    );
    reply.header("X-Permitted-Cross-Domain-Policies", "none");
  });

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
      secret: process.env.JWT_SECRET!,
    });
    await fastify.listen({
      port: Number(process.env.PORT) || 8010,
      host: "0.0.0.0",
    });
    console.log(
      `Server is running on http://localhost::${process.env.PORT || 8010}`
    );
    fastify.swagger();
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

bootstrap();
