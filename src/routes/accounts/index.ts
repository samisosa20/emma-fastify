import { AccountController } from "@controllers";
import {
  createAccountDocumentation,
  deleteAccountDocumentation,
  getAccountDocumentation,
  updateAccountDocumentation,
  listAccountsDocumentation,
} from "src/documentation";
import { FastifyPluginAsync } from "fastify";

import { validateAccountCreate, validateAccountUpdate } from "packages/shared";

const accountsRoutes: FastifyPluginAsync = async (fastify) => {
  const accountController = new AccountController();

  fastify.get(
    "/",
    {
      preHandler: [fastify.authenticate],
      schema: listAccountsDocumentation,
    },
    accountController.getAllAccounts
  );

  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate, validateAccountCreate],
      schema: createAccountDocumentation,
    },
    accountController.addAccount
  );

  fastify.get(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: getAccountDocumentation,
    },
    accountController.detailAccount
  );

  fastify.put(
    "/:id",
    {
      preHandler: [fastify.authenticate, validateAccountUpdate],
      schema: updateAccountDocumentation,
    },
    accountController.updateAccount
  );

  fastify.delete(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: deleteAccountDocumentation,
    },
    accountController.deleteAccount
  );

  fastify.post(
    "/import-accounts",
    {
      preHandler: [fastify.authenticate],
    },
    accountController.importAccounts
  );
};

export default accountsRoutes;
