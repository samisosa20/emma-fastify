import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";

import prisma from "../../packages/shared/settings/prisma.client";
import { User } from "../../packages/user/domain/user";

// Use TypeScript module augmentation to declare the type of server.prisma to be PrismaClient
declare module "fastify" {
  interface FastifyInstance {
    prisma: typeof prisma;
    authenticate: any;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: User; // Sobreescribimos el tipo de `user`
  }
}

const prismaPlugin: FastifyPluginAsync = fp(async (server, options) => {
  await prisma.$connect();

  // Make Prisma Client available through the fastify server instance: server.prisma
  server.decorate("prisma", prisma);

  server.addHook("onClose", async (server) => {
    await server.prisma.$disconnect();
  });
});

export default prismaPlugin;
