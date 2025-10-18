export enum TransactionType {
  Income = 1,
  Expense = 2
}

export enum CategoryType {
  Income = 1,
  Expense = 2
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  createdAt: string;
}

export interface CreateTransaction {
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  type: CategoryType;
  createdAt: string;
  transactionCount: number;
}

export interface CreateCategory {
  name: string;
  description?: string;
  type: CategoryType;
}

export interface Summary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  totalTransactions: number;
  periodStart: string;
  periodEnd: string;
}