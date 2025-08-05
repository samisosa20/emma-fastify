export type User = {
  id: string;
  email: string;
  name: string;
  password: string;
  badgeId: string;
  phone: string | null;
  phoneCode: string | null;
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

export type UserLogin = Omit<
  User,
  | "password"
  | "createdAt"
  | "updatedAt"
  | "confirmedEmailAt"
  | "tokenRecoveryPassword"
> & {
  transferId: string;
};
