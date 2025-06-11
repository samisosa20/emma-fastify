import { FastifyInstance } from "fastify";
import { readdirSync } from "fs";
import { join } from "path";

export async function registerDecorators(fastify: FastifyInstance) {
  const files = readdirSync(__dirname).filter(
    (file) =>
      file !== "index.ts" &&
      file !== "index.js" &&
      (file.endsWith(".ts") || file.endsWith(".js"))
  );

  for (const file of files) {
    const modulePath = join(__dirname, file);
    const register = (await import(modulePath)).default;
    await register(fastify);
  }
}
