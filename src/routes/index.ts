import { FastifyPluginAsync } from "fastify";

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/",
    {
      schema: {
        description: "Example endpoint",
        tags: ["Example"],
        summary: "Get example",
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      return { message: "Hello, Emma!" };
    }
  );
};

export default routes;
