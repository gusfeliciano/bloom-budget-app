import { supabase } from './supabase';
import { Account } from '@/types/accounts';


export async function fetchUserAccounts(userId: string): Promise<Account[]> {
  const { data, error } = await supabase
    .from('user_accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at');

  if (error) throw error;
  return data;
}

export async function createUserAccount(userId: string, account: Omit<Account, 'id' | 'user_id'>): Promise<Account> {
  console.log('Creating user account', { userId, account });
  const { data, error } = await supabase
    .from('user_accounts')
    .insert({ id: userId, ...account, user_id: userId })
    .single();

  if (error) {
    console.error('Supabase error creating account:', error);
    throw error;
  }

  console.log('Account created in Supabase', data);
  return data;
}



export async function addAccount(account: Omit<Account, 'id'>, userId: string): Promise<Account> {
  const { data, error } = await supabase
    .from('user_accounts')
    .insert({
      user_id: userId,
      name: account.name,
      type: account.type,
      balance: account.balance
    })
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