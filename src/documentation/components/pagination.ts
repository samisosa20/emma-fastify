export type SchemaDefault = {
  name: string;
  type: string | string[];
  body: boolean | string[];
  private: boolean;
  nulleable?: boolean;
  properties?: {
    [key: string]: {
      type: string | string[];
      properties?: {
        [key: string]: {
          type: string | string[];
        };
      };
    };
  };
  items?: {
    type: string | string[];
    properties?: {
      [key: string]: {
        type: string | string[];
      };
    };
  };
};

export const defaultSuccesResponse = (schema: SchemaDefault[]) => {
  return {
    type: "object",
    properties: schema
      .filter((v) => !v.private)
      .map((v) => {
        return {
          [v.name]: {
            type: v.type,
            ...(v.type === "object" &&
              v.properties && {
                properties: v.properties,
              }),
            ...(Array.isArray(v.type) &&
              v.type.includes("object") &&
              v.properties && {
                type: "object",
                properties: v.properties,
              }),
            ...(v.type === "array" && { items: v.items }),
          },
        };
      })
      .reduce((acc, item) => {
        return { ...acc, ...item };
      }, {}),
    required: schema
      .filter((v) => {
        if (v.private) return false;

        const isTypeNull = (type: string | string[] | undefined): boolean => {
          if (!type) return false;
          return Array.isArray(type) ? type.includes("null") : type === "null";
        };

        return !isTypeNull(v.type);
      })
      .map((v) => v.name),
  };
};

export const paginationDocumentation = (schema: SchemaDefault[]) => {
  return {
    type: "object",
    properties: {
      content: {
        type: "array",
        items: defaultSuccesResponse(schema),
      },
      meta: {
        type: "object",
        properties: {
          isFirstPage: { type: "boolean" },
          isLastPage: { type: "boolean" },
          currentPage: { type: "integer" },
          previousPage: { type: ["integer", "null"] },
          nextPage: { type: ["integer", "null"] },
          pageCount: { type: "integer" },
          totalCount: { type: "integer" },
        },
        required: [
          "isFirstPage",
          "isLastPage",
          "currentPage",
          "previousPage",
          "nextPage",
          "pageCount",
          "totalCount",
        ],
      },
    },
    required: ["content", "meta"],
  };
};

export const paginationParamsDocumentation = () => {
  return {
    deleted: {
      type: "string",
      description: "show delete data",
    },
    page: {
      type: "string",
      description: "show page",
    },
    size: {
      type: "string",
      description: "size of pagination",
    },
  };
};
