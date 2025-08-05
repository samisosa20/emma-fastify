import { IUserRepository } from "../domain/interfaces/user.interfaces";
import { User, CreateUser, UserLogin } from "../domain/user";

import prisma from "packages/shared/settings/prisma.client";

import {
  CommonParamsPaginate,
  ErrorMessage,
  handleShowDeleteData,
  hashPassword,
  sendEmailConfirmation,
  verifyPassword,
} from "packages/shared";
import { Paginate } from "packages/shared";

export class UserRepositoryPrismaPostgres implements IUserRepository {
  public async addUser(
    user: CreateUser
  ): Promise<Omit<User, "password"> | ErrorMessage> {
    const userExist = await prisma.user.findFirst({
      where: {
        email: user.email,
      },
    });

    if (userExist) {
      return {
        statusCode: 409,
        message: "User already exists",
        error: "User already exists",
      };
    }

    return await prisma.user.create({
      data: {
        ...user,
        password: await hashPassword(user.password),
      },
    });
  }
  public async listUser(
    params: CommonParamsPaginate
  ): Promise<{ content: Omit<User, "password">[]; meta: Paginate }> {
    const { deleted, size, page } = params;
    const [content, meta] = await prisma.user
      .paginate({
        where: {
          OR: handleShowDeleteData(deleted === "1"),
        },
      })
      .withPages({
        limit: size ? Number(size) : 10,
        page: page && page > 0 ? Number(page) : 1,
      });

    return {
      content,
      meta,
    };
  }
  public async updateUser(
    id: string,
    user: Omit<CreateUser, "email">
  ): Promise<Omit<User, "password"> | ErrorMessage> {
    try {
      if (user.password) {
        const userExist = await prisma.user.findFirst({
          where: { id },
          select: { password: true },
        });
        if (userExist && user.currentPassword) {
          if (
            !(await verifyPassword(user.currentPassword, userExist.password))
          ) {
            return {
              statusCode: 400,
              error: "Bad request",
              message: "Invalid password",
            };
          }
          if (user.confirmPassword !== user.password) {
            return {
              statusCode: 400,
              error: "Bad request",
              message: "Password confirm isn't equal",
            };
          }
        }
      }
      const { currentPassword, confirmPassword, ...userWithoutPasswordValid } =
        user;

      return await prisma.user.update({
        where: {
          id,
        },
        data: {
          ...userWithoutPasswordValid,
          ...(user.password && { password: await hashPassword(user.password) }),
        },
      });
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }
  public async detailUser(id: string): Promise<Omit<User, "password"> | null> {
    try {
      return await prisma.user.findUnique({
        where: { id },
      });
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }
  public async deleteUser(id: string): Promise<Omit<User, "password"> | null> {
    try {
      return await prisma.user.delete({
        where: { id },
      });
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }
  public async login(
    email: string,
    password: string
  ): Promise<UserLogin | ErrorMessage> {
    const user = await prisma.user.findFirst({
      where: {
        email,
        confirmedEmailAt: {
          not: null,
        },
      },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        confirmedEmailAt: true,
        phone: true,
        phoneCode: true,
        badgeId: true,
      },
    });

    const transferId = await prisma.category.findFirst({
      where: {
        name: "Transferencia",
      },
      select: {
        id: true,
      },
    });

    if (
      !transferId ||
      !user ||
      !(await verifyPassword(password, user.password))
    ) {
      return {
        statusCode: 401,
        message: "Invalid email or password",
        error: "Unauthorized",
      };
    }

    const { password: pssd, ...userWithOutPassword } = user;

    return { ...userWithOutPassword, transferId: transferId.id };
  }

  public async emailConfirmation(
    email: string,
    token: string
  ): Promise<UserLogin | ErrorMessage> {
    // Find the token in the database
    const storedToken = await prisma.emailConfirmationToken.findFirst({
      where: { token, email, expiresAt: { gte: new Date() } },
    });

    if (!storedToken) {
      return {
        statusCode: 400,
        message: "Bad request",
        error: "Invalid or expired token.",
      };
    }

    // Mark the user's email as confirmed
    const user = await prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        confirmedEmailAt: true,
        phone: true,
        phoneCode: true,
        badgeId: true,
      },
    });

    const transferId = await prisma.category.findFirst({
      where: {
        name: "Transferencia",
      },
      select: {
        id: true,
      },
    });

    if (!transferId || !user) {
      return {
        statusCode: 401,
        message: "Invalid user",
        error: "Unauthorized",
      };
    }

    await prisma.user.updateMany({
      where: { id: user?.id },
      data: { confirmedEmailAt: new Date() },
    });

    // Delete the token
    await prisma.emailConfirmationToken.delete({
      where: { id: storedToken.id },
    });

    const { password: pssd, ...userWithOutPassword } = user;

    return { ...userWithOutPassword, transferId: transferId.id };
  }

  public async sendEmailConfirmation(
    email: string
  ): Promise<{ token: string } | ErrorMessage> {
    // Check if the user exists
    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return {
        statusCode: 400,
        message: "Bad request",
        error: "User not found.",
      };
    }

    if (user.confirmedEmailAt) {
      return {
        statusCode: 400,
        message: "Bad request",
        error: "User already confirm the email",
      };
    }

    // Generate a secure token
    const token = crypto.randomUUID();

    await prisma.emailConfirmationToken.deleteMany({
      where: {
        email,
      },
    });

    // Save the token in the database (optional: with an expiration date)
    await prisma.emailConfirmationToken.create({
      data: {
        token,
        email,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // Token expires in 1 hour
      },
    });

    await sendEmailConfirmation(email, token);

    return {
      statusCode: 200,
      message:
        "Confirmation email sent." +
        `${process.env.APP_URL}/confirm-email?token=${token}&email=${email}`,
      error: `Email sent to ${email} `,
    };
  }

  public async recoveryPassword(email: string): Promise<ErrorMessage> {
    // Check if the user exists
    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return {
        statusCode: 200,
        message: "Email sent",
        error: "Email sent",
      };
    }

    // Generate a secure token
    const token = crypto.randomUUID();

    await prisma.user.update({
      data: {
        tokenRecoveryPassword: token,
      },
      where: {
        id: user.id,
      },
    });

    await sendEmailConfirmation(email, token);

    return {
      statusCode: 200,
      message:
        "Email sent." +
        `${process.env.APP_URL}/recovery-password?token=${token}&email=${email}`,
      error: `Email sent `,
    };
  }
}
