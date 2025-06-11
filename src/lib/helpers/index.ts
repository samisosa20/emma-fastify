import { User } from "packages/user/domain/user";

export const formatErrorMessage = (error: any) => {
  if (error.issues) {
    return error.issues
      .map((issue: { message: string }) => issue.message)
      .join(", ");
  }
  if (error.code) {
    return error.code;
  }
};
