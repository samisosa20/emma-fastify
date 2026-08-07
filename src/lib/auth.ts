import { betterAuth, CookieOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../../packages/shared/settings/prisma.client";
import { sendEmailConfirmation } from "../../packages/shared";
import { customSession } from "better-auth/plugins";

const isProduction = process.env.NODE_ENV === "production";

const crossSiteCookieAttributes: CookieOptions = {
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
} as const;

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
  advanced: {
    useSecureCookies: isProduction,
    defaultCookieAttributes: crossSiteCookieAttributes,
  },
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
      // ⚡ Bolt: Fetch global lookup data and user metadata in parallel to reduce session resolution latency.
      const [periods, badges, accountTypes, groupCategories, userFromDb] =
        await Promise.all([
          prisma.period.findMany(),
          prisma.badge.findMany(),
          prisma.accountType.findMany(),
          prisma.groupCategory.findMany(),
          prisma.user.findUnique({
            where: { id: user.id },
            select: { confirmedEmailAt: true, badgeId: true },
          }),
        ]);
      return {
        user: {
          ...user,
          isConfirmed: !!userFromDb?.confirmedEmailAt,
          confirmedEmailAt: userFromDb?.confirmedEmailAt,
          badgeId: userFromDb?.badgeId,
        },
        session: {
          ...session,
        },
        periods,
        badges,
        accountTypes,
        groupCategories,
      };
    }),
  ],
});
