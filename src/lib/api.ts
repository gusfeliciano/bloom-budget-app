import { toast } from 'react-hot-toast';
import { supabase } from './supabase';
import { Account } from '@/types/accounts';

export async function fetchUserAccounts(userId: string): Promise<Account[]> {
  try {
    const { data, error } = await supabase
      .from('user_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching accounts:', error);
    toast.error('Failed to fetch accounts. Please try again.');
    return [];
  }
}

export async function createUserAccount(
  userId: string, 
  account: Pick<Account, 'name' | 'type' | 'balance'>
): Promise<Account | null> {
  try {
    const { data, error } = await supabase
      .from('user_accounts')
      .insert({ ...account, user_id: userId })
      .single();

    if (error) throw error;
    toast.success('Account created successfully!');
    return data;
  } catch (error) {
    console.error('Error creating account:', error);
    toast.error('Failed to create account. Please try again.');
    return null;
  }
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

export async function deleteUserAccount(id: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_accounts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast.success('Account deleted successfully!');
  } catch (error) {
    console.error('Error deleting account:', error);
    toast.error('Failed to delete account. Please try again.');
  }
}

export async function updateUserAccount(id: number, updates: Partial<Account>): Promise<Account | null> {
  try {
    const { data, error } = await supabase
      .from('user_accounts')
      .update(updates)
      .eq('id', id)
      .single();

    if (error) throw error;
    toast.success('Account updated successfully!');
    return data;
  } catch (error) {
    console.error('Error updating account:', error);
    toast.error('Failed to update account. Please try again.');
    return null;
  }
}