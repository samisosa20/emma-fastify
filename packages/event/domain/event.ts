export type Event = {
  id: string;
  name: string;
  endEvent: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateEvent = Omit<Event, "id" | "createdAt" | "updatedAt">;
