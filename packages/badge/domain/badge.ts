export type Badge = {
  id: string;
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateBadge = Omit<Badge, "id" | "createdAt" | "updatedAt">;
