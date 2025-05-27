export type GroupCategory = {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export type CreateGroupCategory = Omit<GroupCategory, 'id' | 'createdAt' | 'updatedAt'>;