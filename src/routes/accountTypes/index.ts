import { AccountTypeController } from "@controllers";
import {
  createAccountTypeDocumentation,
  deleteAccountTypeDocumentation,
  getAccountTypeDocumentation,
  updateAccountTypeDocumentation,
  listAccountTypesDocumentation,
} from "src/documentation"; // Asegúrate de que estos objetos de documentación existan
import { FastifyPluginAsync } from "fastify";

import {
  validateAccountTypeCreate,
  validateAccountTypeUpdate,
} from "packages/shared"; // Asegúrate de que estas funciones de validación existan

const accountTypesRoutes: FastifyPluginAsync = async (fastify) => {
  const accountTypeController = new AccountTypeController();

  fastify.get(
    "/",
    {
      preHandler: [fastify.authenticate],
      schema: listAccountTypesDocumentation,
    },
    accountTypeController.getAllAccountTypes
  );

  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate, validateAccountTypeCreate],
      schema: createAccountTypeDocumentation,
    },
    accountTypeController.addAccountType
  );

  fastify.get(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: getAccountTypeDocumentation,
    },
    accountTypeController.detailAccountType
  );

  fastify.put(
    "/:id",
    {
      preHandler: [fastify.authenticate, validateAccountTypeUpdate],
      schema: updateAccountTypeDocumentation,
    },
    accountTypeController.updateAccountType
  );

  fastify.delete(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: deleteAccountTypeDocumentation,
    },
    accountTypeController.deleteAccountType
  );
};

export default accountTypesRoutes;
