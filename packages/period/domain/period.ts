export type Period = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreatePeriod = Omit<Period, "id" | "createdAt" | "updatedAt">;
