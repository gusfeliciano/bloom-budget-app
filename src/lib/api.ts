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
  type: 'income' | 'expense';
  isParent?: boolean;
  children: TransactionCategory[]; 
}

export async function fetchTransactions(
  userId: string, 
  page: number = 1, 
  pageSize: number = 10
): Promise<{ transactions: Transaction[], total: number }> {
  try {
    const startDate = new Date();
    startDate.setDate(1); // First day of current month
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1); // First day of next month

    const { data, error, count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .gte('date', startDate.toISOString())
      .lt('date', endDate.toISOString())
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
      .order('parent_id', { nullsFirst: true })
      .order('name');

    if (error) throw error;

    if (data && data.length > 0) {
      return buildCategoryHierarchy(data);
    } else {
      await addDefaultCategories(userId);
      const { data: newData, error: newError } = await supabase
        .from('transaction_categories')
        .select('*')
        .eq('user_id', userId)
        .order('parent_id', { nullsFirst: true })
        .order('name');

      if (newError) throw newError;

      return buildCategoryHierarchy(newData || []);
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    toast.error('Failed to fetch categories. Please try again.');
    return [];
  }
}

function buildCategoryHierarchy(categories: TransactionCategory[]): TransactionCategory[] {
  const categoryMap = new Map<number, TransactionCategory>();
  const rootCategories: TransactionCategory[] = [];

  categories.forEach(category => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  categories.forEach(category => {
    if (category.parent_id === null) {
      rootCategories.push(categoryMap.get(category.id)!);
    } else {
      const parentCategory = categoryMap.get(category.parent_id);
      if (parentCategory) {
        parentCategory.children.push(categoryMap.get(category.id)!);
      }
    }
  });

  return rootCategories;
}

export async function createCategory(
  userId: string, 
  name: string, 
  parentId: number | null = null,
  type: 'income' | 'expense'
): Promise<TransactionCategory | null> {
  try {
    let parent_id = parentId;

    // If parentId is provided, check if it exists
    if (parentId !== null) {
      const { data: parentCategory, error: parentCheckError } = await supabase
        .from('transaction_categories')
        .select('id')
        .eq('id', parentId)
        .single();

      if (parentCheckError || !parentCategory) {
        console.error('Parent category not found:', parentCheckError);
        parent_id = null; // Set to null if parent doesn't exist
      }
    }

    const newCategory = { user_id: userId, name, parent_id, type };
    console.log('Creating category:', newCategory);

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

export async function addDefaultCategories(userId: string): Promise<void> {
  const defaultCategories = [
    { name: 'Income', type: 'income', parent_id: null },
    { name: 'Auto & Transport', type: 'expense', parent_id: null },
    { name: 'Bills & Utilities', type: 'expense', parent_id: null },
  ];

  const childCategories = [
    { name: '💵 Paychecks', type: 'income', parent_name: 'Income' },
    { name: '💸 Interest', type: 'income', parent_name: 'Income' },
    { name: '💰 Business Income', type: 'income', parent_name: 'Income' },
    { name: '💰 Other Income', type: 'income', parent_name: 'Income' },
    { name: '🚃 Public Transit', type: 'expense', parent_name: 'Auto & Transport' },
    { name: '🚗 Auto Payment', type: 'expense', parent_name: 'Auto & Transport' },
    { name: '⛽️ Gas', type: 'expense', parent_name: 'Auto & Transport' },
    { name: '🔧 Auto Maintenance', type: 'expense', parent_name: 'Auto & Transport' },
    { name: '🏢 Parking & Tolls', type: 'expense', parent_name: 'Auto & Transport' },
    { name: '🚕 Taxi & Ride Shares', type: 'expense', parent_name: 'Auto & Transport' },
    { name: '🗑️ Garbage', type: 'expense', parent_name: 'Bills & Utilities' },
    { name: '💧 Water', type: 'expense', parent_name: 'Bills & Utilities' },
    { name: '⚡️ Gas & Electric', type: 'expense', parent_name: 'Bills & Utilities' },
    { name: '🌐 Internet & Cable', type: 'expense', parent_name: 'Bills & Utilities' },
    { name: '📱 Phone', type: 'expense', parent_name: 'Bills & Utilities' },
  ];

  try {
    // First, fetch existing categories
    const { data: existingCategories, error: fetchError } = await supabase
      .from('transaction_categories')
      .select('name, id')
      .eq('user_id', userId);

    if (fetchError) throw fetchError;

    const existingCategoryMap = new Map(existingCategories.map(cat => [cat.name, cat.id]));

    // Upsert parent categories
    const parentUpsertData = defaultCategories.map(cat => ({
      ...cat,
      user_id: userId,
      id: existingCategoryMap.get(cat.name) // Use existing ID if category exists
    }));

    const { data: parentData, error: parentError } = await supabase
      .from('transaction_categories')
      .upsert(parentUpsertData)
      .select();

    if (parentError) throw parentError;

    // Create a map of parent names to their IDs
    const parentMap = new Map(parentData.map(cat => [cat.name, cat.id]));

    // Upsert child categories
    const childUpsertData = childCategories.map(cat => ({
      name: cat.name,
      type: cat.type,
      user_id: userId,
      parent_id: parentMap.get(cat.parent_name),
      id: existingCategoryMap.get(cat.name) // Use existing ID if category exists
    }));

    const { error: childError } = await supabase
      .from('transaction_categories')
      .upsert(childUpsertData);

    if (childError) throw childError;

    console.log('Default categories added or updated successfully');
  } catch (error) {
    console.error('Error in addDefaultCategories:', error);
    toast.error('Failed to add default categories. Please try again or contact support.');
  }
}

function flattenCategories(categories: any[], parentId: number | null = null): any[] {
  return categories.reduce((acc, category) => {
    const { children, ...categoryWithoutChildren } = category;
    const flatCategory = { ...categoryWithoutChildren, parent_id: parentId };
    acc.push(flatCategory);
    if (children) {
      acc.push(...flattenCategories(children, category.id));
    }
    return acc;
  }, []);
}

export interface Budget {
  id: number;
  user_id: string;
  category_id: number;
  month: string;
  assigned: number;
  actual: number;  
}

export async function fetchBudget(userId: string, month: string): Promise<Budget[]> {
  try {
    const startDate = `${month}-01`;
    const endDate = new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + 1)).toISOString().split('T')[0];

    const { data: budgets, error: budgetError } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .gte('month', startDate)
      .lt('month', endDate);

    if (budgetError) throw budgetError;

    const { data: transactions, error: transactionError } = await supabase
      .from('transactions')
      .select('category_id, amount, type')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lt('date', endDate);

    if (transactionError) throw transactionError;

    const { data: categories, error: categoryError } = await supabase
      .from('transaction_categories')
      .select('*')
      .eq('user_id', userId);

    if (categoryError) throw categoryError;

    const categoryMap = new Map(categories.map(c => [c.id, c]));

    const actualSpending = transactions.reduce((acc, transaction) => {
      const category = categoryMap.get(transaction.category_id);
      if (category && category.type === 'expense') {
        acc[transaction.category_id] = (acc[transaction.category_id] || 0) + transaction.amount;
      }
      return acc;
    }, {} as Record<number, number>);

    return budgets.map(budget => {
      const category = categoryMap.get(budget.category_id);
      return {
        ...budget,
        actual: actualSpending[budget.category_id] || 0,
        assigned: budget.assigned || 0,
        type: category ? category.type : 'expense'
      };
    });
  } catch (error) {
    console.error('Error fetching budget:', error);
    toast.error('Failed to fetch budget. Please try again.');
    return [];
  }
}

export async function updateBudget(budget: Omit<Budget, 'id'>): Promise<Budget | null> {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .upsert({
        user_id: budget.user_id,
        category_id: budget.category_id,
        month: `${budget.month}-01`,
        assigned: budget.assigned,
        actual: budget.actual  // Make sure to include this
      })
      .select()
      .single();

    if (error) throw error;
    toast.success('Budget updated successfully!');
    return data;
  } catch (error) {
    console.error('Error updating budget:', error);
    toast.error('Failed to update budget. Please try again.');
    return null;
  }
}

export async function fetchBudgetSummary(userId: string, month: string): Promise<{ income: number; expenses: number; }> {
  try {
    const startDate = `${month}-01`;
    const endDate = new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + 1)).toISOString().split('T')[0];

    const { data: transactions, error: transactionError } = await supabase
      .from('transactions')
      .select('amount, category_id')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lt('date', endDate);

    if (transactionError) throw transactionError;

    const { data: categories, error: categoryError } = await supabase
      .from('transaction_categories')
      .select('id, type');

    if (categoryError) throw categoryError;

    const categoryTypes = Object.fromEntries(categories.map(c => [c.id, c.type]));

    const summary = transactions.reduce((acc, transaction) => {
      const type = categoryTypes[transaction.category_id];
      if (type === 'income') {
        acc.income += transaction.amount;
      } else {
        acc.expenses += transaction.amount;
      }
      return acc;
    }, { income: 0, expenses: 0 });

    return summary;
  } catch (error) {
    console.error('Error fetching budget summary:', error);
    toast.error('Failed to fetch budget summary. Please try again.');
    return { income: 0, expenses: 0 };
  }
}