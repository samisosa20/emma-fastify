import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../../packages/shared/settings/prisma.client";
import { sendEmailConfirmation } from "../../packages/shared";
import { customSession } from "better-auth/plugins";

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
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const token = crypto.randomUUID();
          await prisma.emailConfirmationToken.create({
            data: {
              token,
              email: user.email,
              expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            },
          });
          await sendEmailConfirmation(user.email, token);
        },
      },
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      const badges = await prisma.badge.findMany();
      const accountTypes = await prisma.accountType.findMany();
      const groupCategories = await prisma.groupCategory.findMany();
      const userFromDb = await prisma.user.findUnique({
        where: { id: user.id },
        select: { confirmedEmailAt: true },
      });
      return {
        user: {
          ...user,
          isConfirmed: !!userFromDb?.confirmedEmailAt,
        },
        session: {
          ...session,
        },
        badges,
        accountTypes,
        groupCategories,
      };
    }),
  ],
});
