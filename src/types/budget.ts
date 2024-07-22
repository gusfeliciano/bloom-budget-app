// Types for budget categories
export interface BudgetCategory {
    id: number;
    name: string;
    limit: number;
    spent: number;
    parentId: number | null;
  }
  
  export interface ParentCategory extends BudgetCategory {
    children: BudgetCategory[];
  }
  
  export type Budget = ParentCategory[];