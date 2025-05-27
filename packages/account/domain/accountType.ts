
export type AccountType = {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export type CreateAccountType = Omit<AccountType, 'id' | 'createdAt' | 'updatedAt'>;