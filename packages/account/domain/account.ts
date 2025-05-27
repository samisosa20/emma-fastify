export type Account = {
  id: string;
  name: string;
  description: string;
  badge_id: number;
  init_amount: number;
  limit: number;
  type_id: number;
  user_id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type CreateAccount = Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;