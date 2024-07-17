import { supabase } from './supabase';
import { Account } from '@/types/accounts';

export async function fetchAccounts(): Promise<Account[]> {
  console.log("Fetching accounts from Supabase...");
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('id');

  console.log("Supabase response:", { data, error });

  if (error) {
    console.error('Error fetching accounts:', error);
    throw error;
  }

  console.log("Fetched accounts:", data);
  return data as Account[];
}

export async function addAccount(account: Omit<Account, 'id'>): Promise<Account> {
  const { data, error } = await supabase
    .from('accounts')
    .insert(account)
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