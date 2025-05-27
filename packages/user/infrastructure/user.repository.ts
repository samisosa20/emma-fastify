import { IUserRepository } from "../domain/interfaces/user.interfaces";
import { User, CreateUser } from "../domain/user";

import prisma from "packages/shared/settings/prisma.client";

import {
  CommonParamsPaginate,
  ErrorMessage,
  handleShowDeleteData,
  hashPassword,
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
      include: {
        company: {
          include: {
            country: true,
          },
        },
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
        include: {
          company: {
            include: {
              country: true,
            },
          },
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
          deletedAt: null,
        },
        data: {
          ...userWithoutPasswordValid,
          ...(user.password && { password: await hashPassword(user.password) }),
        },
        include: {
          company: {
            include: {
              country: true,
            },
          },
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
        include: {
          company: {
            include: {
              country: true,
            },
          },
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
  public async deleteUser(id: string): Promise<Omit<User, "password"> | null> {
    try {
      return await prisma.user.deleted({
        where: { id },
        include: {
          company: {
            include: {
              country: true,
            },
          },
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
}
