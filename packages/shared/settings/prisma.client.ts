import { PrismaClient } from "@prisma/client";
import { pagination } from "prisma-extension-pagination";

const prisma = new PrismaClient({
  omit: {
    user: {
      password: true,
    },
  },
}).$extends(
  pagination({
    pages: {
      limit: 10,
      includePageCount: true,
    },
  })
);

export default prisma;
