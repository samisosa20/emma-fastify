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

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const authController = new AuthController(fastify);
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
