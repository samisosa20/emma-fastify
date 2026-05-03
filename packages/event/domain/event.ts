export type Event = {
  id: string;
  name: string;
  endEvent: Date;
  userId: string;
  type: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateEvent = Omit<Event, "id" | "createdAt" | "updatedAt">;
