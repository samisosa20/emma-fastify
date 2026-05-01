import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { auth } from "@lib/auth";
import { fromNodeHeaders } from "better-auth/node";

export default async function (fastify: FastifyInstance) {
  fastify.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      if (!session) {
        reply.code(401).send({ message: "Unauthorized" });
        return;
      }

      // @ts-ignore
      request.user = session.user;
    }
  );
}
