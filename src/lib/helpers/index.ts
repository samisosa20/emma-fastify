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

/**
 * Security: Checks if the user has administrative privileges.
 * This prevents unauthorized modification of global resources by regular users.
 * Ensure ADMIN_EMAIL is set in the environment to enable administrative access.
 *
 * @param user - The authenticated user object from the request.
 * @returns boolean - True if the user is a verified administrator and their email is confirmed, false otherwise.
 */
export const isAdmin = (user: any): boolean => {
  const adminEmail = process.env.ADMIN_EMAIL;
  // Fail secure: ensure both email and ADMIN_EMAIL are present and not undefined
  // and that the account is verified via confirmedEmailAt.
  if (!adminEmail || !user?.email || !user?.confirmedEmailAt) {
    return false;
  }
  return user.email === adminEmail;
};
