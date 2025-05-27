import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }
  
  export async function verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  }
  
  export function handleShowDeleteData(show?: boolean) {
    const orConditions: any[] = [{ deletedAt: null }];
    if (show) {
      orConditions.push({ deletedAt: { not: null } });
    }
    return orConditions;
  }