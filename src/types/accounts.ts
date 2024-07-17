  export interface Account {
    id: number;
    name: string;
    type: string;
    balance: number;
    parent_id?: number | null;
    subAccounts?: Account[];
  }