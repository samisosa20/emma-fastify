export type Badge = {
  id: string;
  name: string;
  code: string;
  symbol: string | null;
  flag: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateBadge = Omit<Badge, "id" | "createdAt" | "updatedAt">;
