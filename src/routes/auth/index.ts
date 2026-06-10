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
import {
  validateUserLogin,
  validateUserRegister,
  validateUserConfirmEmail,
  validateUserResendEmail,
  validateUserRecoveryPassword,
} from "packages/shared";

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const authController = new AuthController(fastify);

  fastify.post(
    "/login",
    {
      preHandler: [validateUserLogin],
      schema: loginDocumentation,
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    authController.loginUser
  );

  fastify.post(
    "/register",
    {
      preHandler: [validateUserRegister],
      schema: registerDocumentation,
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    authController.registerReguralUser
  );

  fastify.post(
    "/confirm-email",
    {
      preHandler: [validateUserConfirmEmail],
      schema: confirmEmailDocumentation,
    },
    authController.emailConfirmation
  );
  fastify.post(
    "/resend-email",
    {
      preHandler: [validateUserResendEmail],
      schema: resendEmailDocumentation,
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    authController.sendEmailConfirmation
  );
  fastify.post(
    "/recovery-password",
    {
      preHandler: [validateUserRecoveryPassword],
      schema: recoveryPasswordDocumentation,
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
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

  fastify.all("/*", async (request, reply) => {
    // Security: Use the trusted APP_URL environment variable for constructing the URL
    // instead of the potentially spoofed Host header to prevent Host Header Injection.
    const url = new URL(request.url, process.env.APP_URL);
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
};

export default authRoutes;
