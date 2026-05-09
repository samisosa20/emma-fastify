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

export type EventBalance = {
  code: string;
  symbol: string;
  flag: string;
  balance: number;
};

export type EventWithBalances = Event & {
  balances: EventBalance[];
};
