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

export interface Transaction {
  id: number;
  user_id: string;
  account_id: number;
  category_id: number;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  created_at: string;
  updated_at: string;
}

export interface TransactionCategory {
  id: number;
  name: string;
  user_id: string;
  parent_id: number | null;
  isParent?: boolean; 
}

export async function fetchTransactions(
  userId: string, 
  page: number = 1, 
  pageSize: number = 10
): Promise<{ transactions: Transaction[], total: number }> {
  try {
    const { data, error, count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;
    return { transactions: data || [], total: count || 0 };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    toast.error('Failed to fetch transactions. Please try again.');
    return { transactions: [], total: 0 };
  }
}

export async function createTransaction(
  userId: string,
  transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Transaction | null> {
  try {
    console.log('Creating transaction:', { userId, transaction });
    const { data, error } = await supabase
      .from('transactions')
      .insert({ 
        ...transaction, 
        user_id: userId,
        category_id: transaction.category_id, // Ensure this is correct
        date: new Date(transaction.date).toISOString() // Ensure date is in ISO format
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Transaction created successfully:', data);
    toast.success('Transaction added successfully!');
    return data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    toast.error(`Failed to add transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

export async function updateTransaction(
  id: number,
  updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<Transaction | null> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .single();

    if (error) throw error;
    toast.success('Transaction updated successfully!');
    return data;
  } catch (error) {
    console.error('Error updating transaction:', error);
    toast.error('Failed to update transaction. Please try again.');
    return null;
  }
}

export async function deleteTransaction(id: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast.success('Transaction deleted successfully!');
  } catch (error) {
    console.error('Error deleting transaction:', error);
    toast.error('Failed to delete transaction. Please try again.');
  }
}

export async function fetchCategories(userId: string): Promise<TransactionCategory[]> {
  try {
    const { data, error } = await supabase
      .from('transaction_categories')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) throw error;

    if (data && data.length > 0) {
      return data.map(category => ({
        ...category,
        isParent: category.parent_id === null
      }));
    } else {
      // If no categories found, return default categories
      return defaultCategories.map((category, index) => ({
        ...category,
        id: index + 1,
        user_id: userId,
        isParent: true
      }));
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    toast.error('Failed to fetch categories. Please try again.');
    return [];
  }
}

export async function createCategory(
  userId: string, 
  name: string, 
  parentId: number | null = null
): Promise<TransactionCategory | null> {
  try {
    const newCategory = { user_id: userId, name, parent_id: parentId };
    console.log('Creating category:', newCategory);

    // If parentId is provided, check if it exists
    if (parentId !== null) {
      const { data: parentCategory, error: parentCheckError } = await supabase
        .from('transaction_categories')
        .select('id')
        .eq('id', parentId)
        .single();

      if (parentCheckError || !parentCategory) {
        console.error('Parent category not found:', parentCheckError);
        throw new Error('Parent category not found');
      }
    }

    const { data, error } = await supabase
      .from('transaction_categories')
      .insert(newCategory)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Category created successfully:', data);
    toast.success('Category created successfully!');
    return data;
  } catch (error) {
    console.error('Error creating category:', error);
    toast.error(`Failed to create category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

export async function updateCategory(
  id: number,
  updates: Partial<Omit<TransactionCategory, 'id' | 'user_id'>>
): Promise<TransactionCategory | null> {
  try {
    const { data, error } = await supabase
      .from('transaction_categories')
      .update(updates)
      .eq('id', id)
      .single();

    if (error) throw error;
    toast.success('Category updated successfully!');
    return data;
  } catch (error) {
    console.error('Error updating category:', error);
    toast.error('Failed to update category. Please try again.');
    return null;
  }
}

export async function deleteCategory(id: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('transaction_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast.success('Category deleted successfully!');
  } catch (error) {
    console.error('Error deleting category:', error);
    toast.error('Failed to delete category. Please try again.');
  }
}

export const defaultCategories: Omit<TransactionCategory, 'id' | 'user_id'>[] = [
  { name: 'Income', parent_id: null },
  { name: 'Salary', parent_id: 1 },
  { name: 'Expenses', parent_id: null },
  { name: 'Groceries', parent_id: 3 },
  { name: 'Investments', parent_id: null },
  { name: 'Retirement Account', parent_id: 5 },
];

export async function addDefaultCategories(userId: string): Promise<void> {
  try {
    // Fetch existing categories for the user
    const { data: existingCategories, error: fetchError } = await supabase
      .from('transaction_categories')
      .select('name')
      .eq('user_id', userId);

    if (fetchError) throw fetchError;

    const existingCategoryNames = new Set(existingCategories?.map(c => c.name) || []);

    // Filter out categories that already exist
    const categoriesToAdd = defaultCategories.filter(c => !existingCategoryNames.has(c.name));

    if (categoriesToAdd.length === 0) {
      console.log('All default categories already exist for this user');
      return;
    }

    // Separate parent and child categories
    const parentCategories = categoriesToAdd.filter(category => category.parent_id === null);
    const childCategories = categoriesToAdd.filter(category => category.parent_id !== null);

    // Insert parent categories
    const { data: insertedParents, error: parentInsertError } = await supabase
      .from('transaction_categories')
      .insert(parentCategories.map(category => ({ ...category, user_id: userId })))
      .select();

    if (parentInsertError) throw parentInsertError;

    // Map the inserted parent categories to their new IDs
    const parentIdMap = new Map(insertedParents.map(parent => [parent.name, parent.id]));

    // Update child categories with the new parent IDs
    const updatedChildCategories = childCategories.map(child => ({
      ...child,
      user_id: userId,
      parent_id: parentIdMap.get(defaultCategories.find(c => c.id === child.parent_id)?.name || '') || null
    }));

    // Insert child categories
    const { error: childInsertError } = await supabase
      .from('transaction_categories')
      .insert(updatedChildCategories);

    if (childInsertError) throw childInsertError;

    console.log('Default categories added successfully');
  } catch (error) {
    console.error('Error adding default categories:', error);
    toast.error('Failed to add default categories. Please try again.');
  }
}