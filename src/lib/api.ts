import { supabase } from './supabase';
import { Account } from '@/types/accounts';

export async function fetchUserAccounts(userId: string): Promise<Account[]> {
  console.log('Fetching accounts for user:', userId);
  const { data, error } = await supabase
    .from('user_accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at');

  if (error) {
    console.error('Error fetching accounts:', error);
    throw error;
  }

  console.log('Fetched accounts:', data);
  return data || [];
}

export async function createUserAccount(
  userId: string, 
  account: Pick<Account, 'name' | 'type' | 'balance'>
): Promise<Account> {
  console.log('Creating account for user:', userId, 'Account details:', account);
  const { data, error } = await supabase
    .from('user_accounts')
    .insert({ 
      ...account, 
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .single();

  if (error) {
    console.error('Detailed error:', error);
    throw error;
  }

  return data;
}

export async function updateAccount(account: Account): Promise<Account> {
  const { data, error } = await supabase
    .from('user_accounts')
    .update({
      ...account,
      updated_at: new Date().toISOString()
    })
    .eq('id', account.id)
    .single();

  if (error) {
    console.error('Error updating account:', error);
    throw error;
  }

  return data;
}

export async function deleteAccount(id: number): Promise<void> {
  const { error } = await supabase
    .from('user_accounts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
}