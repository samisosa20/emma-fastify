export type Badge = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateBadge = Omit<Badge, 'id' | 'createdAt' | 'updatedAt'>;