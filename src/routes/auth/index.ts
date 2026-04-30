import { AuthController } from "@controllers";
import {
  confirmEmailDocumentation,
  loginDocumentation,
  registerDocumentation,
  resendEmailDocumentation,
  recoveryPasswordDocumentation,
  getProfileDocumentation,
} from "src/documentation";
import { FastifyPluginAsync } from "fastify";
import { auth } from "@lib/auth";
import { fromNodeHeaders } from "better-auth/node";

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const authController = new AuthController(fastify);

  fastify.all("/auth/*", async (request, reply) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const headers = fromNodeHeaders(request.headers);

    const req = new Request(url.toString(), {
      method: request.method,
      headers,
      ...(request.body ? { body: JSON.stringify(request.body) } : {}),
    });

    const response = await auth.handler(req);

    reply.status(response.status);
    response.headers.forEach((value: string, key: string) =>
      reply.header(key, value)
    );
    return reply.send(response.body ? await response.text() : null);
  });

  fastify.post(
    "/login",
    { schema: loginDocumentation },
    authController.loginUser
  );

  fastify.post(
    "/register",
    { schema: registerDocumentation },
    authController.registerReguralUser
  );

  fastify.post(
    "/confirm-email",
    { schema: confirmEmailDocumentation },
    authController.emailConfirmation
  );
  fastify.post(
    "/resend-email",
    { schema: resendEmailDocumentation },
    authController.sendEmailConfirmation
  );
  fastify.post(
    "/recovery-password",
    { schema: recoveryPasswordDocumentation },
    authController.recoveryPassword
  );
  fastify.get(
    "/profile",
    {
      preHandler: [fastify.authenticate],
      schema: getProfileDocumentation,
    },
    authController.getProfile
  );
};

export default authRoutes;
