import { supabase } from './supabase';
import { Account } from '@/types/accounts';


export async function fetchAccounts(userId: string): Promise<Account[]> {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('id');

  if (error) {
    console.error('Error fetching accounts:', error);
    throw error;
  }

  return data as Account[];
}

export async function addAccount(account: Omit<Account, 'id'>, userId: string): Promise<Account> {
  const { data, error } = await supabase
    .from('accounts')
    .insert({ ...account, user_id: userId })
    .single();

  if (error) {
    console.error('Error adding account:', error);
    throw error;
  }

  return data as Account;
}

export async function updateAccount(account: Account): Promise<Account> {
  const { data, error } = await supabase
    .from('accounts')
    .update(account)
    .eq('id', account.id)
    .single();

  if (error) {
    console.error('Error updating account:', error);
    throw error;
  }

  return data as Account;
}

export async function deleteAccount(id: number): Promise<void> {
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
}