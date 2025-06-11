import { FastifyDynamicSwaggerOptions } from "@fastify/swagger";
import { FastifySwaggerUiOptions } from "@fastify/swagger-ui";
import { SwaggerTheme, SwaggerThemeNameEnum } from "swagger-themes";

const theme = new SwaggerTheme();
const content = theme.getBuffer(SwaggerThemeNameEnum.DARK);

export const swaggerOptions: FastifyDynamicSwaggerOptions = {
  openapi: {
    openapi: "3.1.0",
    info: {
      title: "Emma API",
      description: "Documentation in swagger API to EMMA",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        apiKey: {
          type: "apiKey",
          name: "apiKey",
          in: "header",
        },
      },
    },
    externalDocs: {
      url: "https://swagger.io",
      description: "Find more info here",
    },
  },
};

export const swaggerUiOptions: FastifySwaggerUiOptions = {
  routePrefix: "/docs", // Ruta donde se sirve Swagger UI
  uiConfig: {
    docExpansion: "list",
    deepLinking: false,
  },
  staticCSP: true,
  transformSpecification: (swaggerObject) => {
    return swaggerObject;
  },
  theme: {
    css: [{ filename: "theme.css", content: content }],
  },
};
