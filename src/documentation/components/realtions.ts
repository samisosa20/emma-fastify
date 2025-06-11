import { SchemaDefault } from "./pagination";

export const getProperties = (schema: SchemaDefault[], depth = 1) => {
  return schema
    ? schema
        .filter((v) => !v.private)
        .reduce((acc, { name, type, properties, items }) => {
          acc[name] = {
            type,
            ...(properties && depth > 0
              ? { properties, required: Object.keys(properties) }
              : {}),
            ...(items && depth > 0 ? { items } : {}),
          };
          return acc;
        }, {} as Record<string, { type: string | string[] }>)
    : {};
};

export const getBody = (schema: SchemaDefault[], type: string) => {
  return {
    type: "object",
    properties: schema
      .filter((v) => v.body && Array.isArray(v.body) && v.body.includes(type))
      .map((v) => {
        return {
          [v.name]: {
            type: v.type,
          },
        };
      })
      .reduce((acc, item) => {
        return { ...acc, ...item };
      }, {}),
  };
};
