import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../../packages/shared/settings/prisma.client";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),
  baseURL: process.env.APP_URL,
  basePath: "/api/v2/auth",
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    process.env.APP_URL || "http://localhost:3000",
    "http://localhost:8010",
  ],
  account: {
    modelName: "oauthAccount",
    fields: {
      accessTokenExpiresAt: "accessTokenExpiresAt",
      refreshTokenExpiresAt: "refreshTokenExpiresAt",
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
});
