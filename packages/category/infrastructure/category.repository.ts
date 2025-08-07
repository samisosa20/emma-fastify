import { Category, CreateCategory } from "../domain/category";
import { ICategoryRepository } from "../domain/interfaces/category.interfaces";
import { CommonParamsPaginate, Paginate, ErrorMessage } from "packages/shared";

import prisma from "packages/shared/settings/prisma.client";
import { handleShowDeleteData } from "packages/shared";
import { APIResponse } from "packages/badge/infrastructure/badge.repository";

type APICategoryResponse = {
  name: string;
  description: string | null;
  group: {
    name: string;
  };
  category_father: {
    name: string;
    group: {
      name: string;
    };
  } | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};
export class CategoryPrismaRepository implements ICategoryRepository {
  async addCategory(
    category: CreateCategory
  ): Promise<Category | ErrorMessage> {
    const newCategory = await prisma.category.create({
      data: {
        ...category,
      },
    });
    return newCategory;
  }

  async listCategories(
    params: CommonParamsPaginate
  ): Promise<{ content: Category[]; meta: Paginate }> {
    const { deleted, size, page: pageParam } = params;

    const shouldPaginate = pageParam && Number(pageParam) > 0;

    let rawContent: Category[];
    let metaResult: Paginate;

    if (shouldPaginate) {
      const currentPage = Number(pageParam);
      const effectiveSize = size && Number(size) > 0 ? Number(size) : 10;

      const [content, metaFromPrisma] = await prisma.category
        .paginate({
          where: {
            OR: handleShowDeleteData(deleted === "1"),
          },
        })
        .withPages({
          limit: effectiveSize,
          page: currentPage,
        });

      rawContent = content as Category[];

      metaResult = metaFromPrisma;
    } else {
      rawContent = (await prisma.category.findMany({})) as Category[];

      const totalCount = rawContent.length;
      const meta: Paginate = {
        isFirstPage: totalCount > 0,
        isLastPage: totalCount > 0,
        currentPage: totalCount > 0 ? 1 : 0,
        previousPage: null,
        nextPage: null,
        pageCount: totalCount > 0 ? 1 : 0,
        totalCount: totalCount,
      };

      metaResult = meta;
    }
    return {
      content: rawContent,
      meta: metaResult,
    };
  }

  async updateCategory(
    id: string,
    category: Partial<CreateCategory>
  ): Promise<Category | ErrorMessage> {
    try {
      const updatedCategory = await prisma.category.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          ...category,
        },
      });
      return updatedCategory;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  async detailCategory(id: string): Promise<Category | null> {
    try {
      return await prisma.category.findUnique({
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

  async deleteCategory(id: string): Promise<Category | null> {
    try {
      return await prisma.category.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async importCategories(id?: string): Promise<{
    categoryCount: number;
  }> {
    try {
      // Validar que las variables de entorno esenciales estén definidas
      const apiProd = process.env.API_PROD;
      const apiEmail = process.env.API_EMAIL;
      const apiPassword = process.env.API_PASSWORD;
      const userId = process.env.USER_ID; // Asumiendo que userId es relevante para las categorías

      if (!apiProd || !apiEmail || !apiPassword || !userId) {
        throw Object.assign(new Error("Missing API environment variables"), {
          statusCode: 500,
          error: "Configuration Error",
          message: "API_PROD, API_EMAIL, API_PASSWORD, or USER_ID are not set.",
        });
      }

      // 1. Iniciar sesión para obtener el token
      const loginResponse = await fetch(`${apiProd}/login`, {
        method: "POST",
        body: JSON.stringify({
          email: apiEmail,
          password: apiPassword,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!loginResponse.ok) {
        const errorText = await loginResponse.text();
        console.error(
          `API login failed: ${loginResponse.status} ${loginResponse.statusText}`,
          errorText
        );
        throw Object.assign(
          new Error(`API login failed: ${loginResponse.statusText}`),
          {
            statusCode: loginResponse.status,
            error: "API Error",
            message: `Failed to login to API: ${loginResponse.status} ${
              loginResponse.statusText
            }. ${errorText || ""}`.trim(),
          }
        );
      }

      const apiResponse: APIResponse = await loginResponse.json();
      const token = apiResponse.token;

      // 2. Obtener las categorías de la API externa
      const categoriesResponse = await fetch(
        id ? `${apiProd}/categories/${id}` : `${apiProd}/categories`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!categoriesResponse.ok) {
        const errorText = await categoriesResponse.text();
        console.error(
          `API categories fetch failed: ${categoriesResponse.status} ${categoriesResponse.statusText}`,
          errorText
        );
        throw Object.assign(
          new Error(
            `API categories fetch failed: ${categoriesResponse.statusText}`
          ),
          {
            statusCode: categoriesResponse.status,
            error: "API Error",
            message: `Failed to fetch categories from API: ${
              categoriesResponse.status
            } ${categoriesResponse.statusText}. ${errorText || ""}`.trim(),
          }
        );
      }

      const rawApiResponse = await categoriesResponse.json();

      let oldCategories: APICategoryResponse[];

      // Si la respuesta es un array, úsala directamente. Si es un objeto, envuélvelo en un array.
      if (Array.isArray(rawApiResponse)) {
        oldCategories = rawApiResponse;
      } else {
        oldCategories = rawApiResponse.categories;
      }

      // 3. Procesar las categorías y prepararlas para la inserción masiva
      const categoriesToCreatePromises = oldCategories.map(async (category) => {
        const groupCategory = await prisma.groupCategory.findFirst({
          where: { name: category.group.name },
        });

        if (!groupCategory) {
          console.warn(
            `GroupCategory '${category.group.name}' not found for category '${category.name}'. Skipping.`
          );
          return null;
        }

        let categoryFatherId: string | null = null;
        if (category.category_father) {
          const categoryFather = await prisma.category.findFirst({
            where: {
              name: category.category_father.name,
            },
          });
          if (categoryFather) {
            categoryFatherId = categoryFather.id;
          } else {
            console.warn(
              `Category father '${category.category_father.name}' not found for category '${category.name}'. Skipping category father association.`
            );
          }
        }

        return {
          name: category.name,
          description: category.description ?? "",
          groupId: groupCategory.id,
          color: "#000000",
          icon: null,
          createdAt: new Date(category.created_at),
          updatedAt: new Date(category.updated_at),
          deletedAt: category.deleted_at ? new Date(category.deleted_at) : null,
          userId: userId,
        } as CreateCategory;
      });

      const categoriesToCreate = (
        await Promise.all(categoriesToCreatePromises)
      ).filter((cat): cat is CreateCategory => cat !== null);

      // 4. Insertar las categorías en la base de datos local
      const result = await prisma.category.createMany({
        data: categoriesToCreate,
        skipDuplicates: true, // Para evitar errores si se intenta importar la misma categoría varias veces
      });

      return {
        categoryCount: result.count,
      };
    } catch (error: unknown) {
      console.error("Error importing categories:", error);
      // Re-lanzar si ya es un error estructurado por este método o un error conocido de Prisma
      if (
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error &&
        "error" in error
      ) {
        throw error;
      }

      // Para otros errores inesperados
      throw Object.assign(
        new Error(
          (error as Error)?.message || "Category import process failed"
        ),
        {
          statusCode: (error as any)?.statusCode || 500,
          error: (error as any)?.error || "Internal Server Error",
          message:
            (error as Error)?.message ||
            "An unexpected error occurred during category import.",
        }
      );
    }
  }
}
