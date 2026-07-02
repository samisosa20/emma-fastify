import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { pagination } from "prisma-extension-pagination";
import mariadb from "mariadb"; //

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const parsedUrl = new URL(databaseUrl);

const adapter = new PrismaMariaDb({
  host: parsedUrl.hostname,
  port: parseInt(parsedUrl.port) || 3306,
  user: parsedUrl.username,
  password: decodeURIComponent(parsedUrl.password),
  database: parsedUrl.pathname.substring(1),
  connectionLimit: 10,
  ssl: parsedUrl.searchParams.get("sslmode") === "skip" ? false : undefined,
});

const prisma = new PrismaClient({
  adapter,
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
  }),
);

export default prisma;
