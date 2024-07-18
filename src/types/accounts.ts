export interface Account {
  id: number;
  user_id: string;
  name: string;
  type: string;
  balance: number;
  parent_id?: number | null;
  created_at?: string;
  updated_at?: string;
}