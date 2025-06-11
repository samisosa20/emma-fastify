export type Category = {
  id: string;
  name: string;
  description: string;
  groupId: string;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  userId: string;
};

export type CreateCategory = Omit<
  Category,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "plannedPayments"
  | "movements"
  | "budgets"
>;
