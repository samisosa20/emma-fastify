import { FastifyPluginAsync } from "fastify";
import { UserRepositoryPrismaPostgres } from "packages/user/infrastructure/user.repository";
import { UserUseCase } from "packages/user/application/user.use-case";
import { errorDocumentation } from "src/documentation/components/error";
import { auth } from "@lib/auth";
import { fromNodeHeaders } from "better-auth/node";

const resendDocumentation = {
  description: "Reenviar correo de confirmación",
  tags: ["Auth"],
  body: {
    type: "object",
    properties: {
      email: { type: "string" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        statusCode: { type: "number" },
        message: { type: "string" },
        data: { type: "boolean" },
      },
    },
    ...errorDocumentation,
  },
};

const emailRoutes: FastifyPluginAsync = async (fastify) => {
  const userRepository = new UserRepositoryPrismaPostgres();
  const userUseCase = new UserUseCase(userRepository);

  fastify.post(
    "/resend",
    {
      schema: resendDocumentation,
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      const body = (request.body || {}) as { email?: string };
      let email = body?.email;

      if (!email) {
        try {
          const session = await auth.api.getSession({
            headers: fromNodeHeaders(request.headers),
          });
          if (session?.user?.email) {
            email = session.user.email;
          }
        } catch {
          // ignore session lookup failure
        }
      }

      if (!email && request.headers.authorization) {
        try {
          const token = request.headers.authorization.replace("Bearer ", "");
          const decoded: any = fastify.jwt.decode(token);
          if (decoded?.email) email = decoded.email;
        } catch {
          // ignore jwt decode failure
        }
      }

      if (!email) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: "No se pudo identificar el correo del usuario.",
        });
      }

      try {
        const result = await userUseCase.sendEmailConfirmation(email);
        if ("statusCode" in result && Number(result.statusCode) >= 400) {
          return reply
            .status(Number(result.statusCode) === 400 ? 400 : 500)
            .send(result);
        }
        return reply.status(200).send({
          statusCode: 200,
          message: "Correo de verificación reenviado correctamente.",
          data: true,
        });
      } catch (error: any) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message:
            error?.message || "Error al reenviar el correo de verificación.",
        });
      }
    }
  );
};

export default emailRoutes;
