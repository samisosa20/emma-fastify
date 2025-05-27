export type User = {
  id: string;
  email: string;
  name: string;
  password: string;
  tokenRecoveryPassword: string | null;
  confirmedEmailAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUser = Omit<
  User,
  | "createdAt"
  | "updatedAt"
  | "confirmedEmailAt"
  | "tokenRecoveryPassword"
  | "id"
> & {
  currentPassword?: string;
  confirmPassword?: string;
};
