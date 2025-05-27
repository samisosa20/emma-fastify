export type Category = {
  id: string;
  name: string;
  description: string;
  group_id: number;
  category_id: number;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type CreateCategory = Omit<
  Category,
  "id" | "created_at" | "updated_at" | "deleted_at"
>;