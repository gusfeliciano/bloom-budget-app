export interface BaseCategory {
  id: number;
  name: string;
  budget: number;
  activity: number;
  remaining: number;
}

export interface BudgetCategory extends BaseCategory {
  parentId: number | null;
  user_id: string;
  type: string;
}

export interface ParentCategory extends BaseCategory {
  children: BudgetCategory[];
  user_id: string;
  type: string;
}

export interface TransactionCategory extends BaseCategory {
  parent_id: number | null;
  type: string;
  children: TransactionCategory[];
  user_id: string;
}

export interface Budget {
  id?: number;
  user_id: string;
  category_id: number;
  month: string;
  assigned: number;
  actual: number;
  type?: string;
}

export interface ReadyToAssign {
  user_id: string;
  month: string;
  amount: number;
}

export type BudgetData = ParentCategory[];