import { Injectable } from '@angular/core';
import { Observable, from, BehaviorSubject, map, catchError, of } from 'rxjs';
import { 
  Transaction, 
  CreateTransaction, 
  TransactionType,
  Summary 
} from '../models/finance.models';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private transactionsSubject = new BehaviorSubject<Transaction[]>([
    {
      id: 1,
      description: 'Salário',
      amount: 5000,
      date: '2025-09-01',
      type: TransactionType.Income,
      categoryId: 7,
      categoryName: 'Salário',
      createdAt: '2025-09-01T10:00:00Z'
    },
    {
      id: 2,
      description: 'Supermercado Extra',
      amount: 350,
      date: '2025-09-15',
      type: TransactionType.Expense,
      categoryId: 1,
      categoryName: 'Alimentação',
      createdAt: '2025-09-15T14:30:00Z'
    },
    {
      id: 3,
      description: 'Freelance Website',
      amount: 1200,
      date: '2025-09-20',
      type: TransactionType.Income,
      categoryId: 8,
      categoryName: 'Freelance',
      createdAt: '2025-09-20T16:00:00Z'
    },
    {
      id: 4,
      description: 'Uber',
      amount: 45,
      date: '2025-09-22',
      type: TransactionType.Expense,
      categoryId: 2,
      categoryName: 'Transporte',
      createdAt: '2025-09-22T18:15:00Z'
    },
    {
      id: 5,
      description: 'Cinema',
      amount: 30,
      date: '2025-09-25',
      type: TransactionType.Expense,
      categoryId: 6,
      categoryName: 'Entretenimento',
      createdAt: '2025-09-25T20:00:00Z'
    },
    {
      id: 6,
      description: 'Conta de Luz',
      amount: 120,
      date: '2025-09-26',
      type: TransactionType.Expense,
      categoryId: 3,
      categoryName: 'Moradia',
      createdAt: '2025-09-26T09:00:00Z'
    },
    {
      id: 7,
      description: 'Farmácia',
      amount: 85,
      date: '2025-09-27',
      type: TransactionType.Expense,
      categoryId: 4,
      categoryName: 'Saúde',
      createdAt: '2025-09-27T11:30:00Z'
    },
    {
      id: 8,
      description: 'Dividendos Ações',
      amount: 250,
      date: '2025-09-27',
      type: TransactionType.Income,
      categoryId: 9,
      categoryName: 'Investimentos',
      createdAt: '2025-09-27T15:00:00Z'
    },
    {
      id: 9,
      description: 'Restaurante',
      amount: 95,
      date: '2025-09-28',
      type: TransactionType.Expense,
      categoryId: 1,
      categoryName: 'Alimentação',
      createdAt: '2025-09-28T13:00:00Z'
    },
    {
      id: 10,
      description: 'Curso Online',
      amount: 199,
      date: '2025-09-28',
      type: TransactionType.Expense,
      categoryId: 5,
      categoryName: 'Educação',
      createdAt: '2025-09-28T16:00:00Z'
    }
  ]);

  public transactions$ = this.transactionsSubject.asObservable();

  constructor() { }

  getTransactions(
    categoryId?: number, 
    type?: TransactionType, 
    startDate?: string, 
    endDate?: string
  ): Observable<Transaction[]> {
    let filtered = [...this.transactionsSubject.value];
    
    if (categoryId) {
      filtered = filtered.filter(t => t.categoryId === categoryId);
    }
    if (type !== undefined) {
      filtered = filtered.filter(t => t.type === type);
    }
    if (startDate) {
      filtered = filtered.filter(t => t.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(t => t.date <= endDate);
    }

    return of(filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }

  getTransaction(id: number): Observable<Transaction | undefined> {
    const transaction = this.transactionsSubject.value.find(t => t.id === id);
    return of(transaction);
  }

  createTransaction(transaction: CreateTransaction): Observable<Transaction> {
    const transactions = this.transactionsSubject.value;
    const newId = Math.max(...transactions.map(t => t.id), 0) + 1;
    
    const newTransaction: Transaction = {
      id: newId,
      description: transaction.description,
      amount: transaction.amount,
      date: transaction.date,
      type: transaction.type,
      categoryId: transaction.categoryId,
      categoryName: this.getCategoryName(transaction.categoryId),
      createdAt: new Date().toISOString()
    };
    
    const updatedTransactions = [newTransaction, ...transactions];
    this.transactionsSubject.next(updatedTransactions);
    
    return of(newTransaction);
  }

  updateTransaction(id: number, transaction: CreateTransaction): Observable<Transaction | undefined> {
    const transactions = this.transactionsSubject.value;
    const index = transactions.findIndex(t => t.id === id);
    
    if (index !== -1) {
      const updatedTransaction: Transaction = {
        ...transactions[index],
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date,
        type: transaction.type,
        categoryId: transaction.categoryId,
        categoryName: this.getCategoryName(transaction.categoryId)
      };
      
      transactions[index] = updatedTransaction;
      this.transactionsSubject.next([...transactions]);
      
      return of(updatedTransaction);
    }
    return of(undefined);
  }

  deleteTransaction(id: number): Observable<boolean> {
    const transactions = this.transactionsSubject.value;
    const filteredTransactions = transactions.filter(t => t.id !== id);
    
    if (filteredTransactions.length !== transactions.length) {
      this.transactionsSubject.next(filteredTransactions);
      return of(true);
    }
    
    return of(false);
  }

  getSummary(startDate?: string, endDate?: string): Observable<Summary> {
    let filtered = [...this.transactionsSubject.value];
    
    if (startDate) {
      filtered = filtered.filter(t => t.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(t => t.date <= endDate);
    }

    const totalIncome = filtered
      .filter(t => t.type === TransactionType.Income)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = filtered
      .filter(t => t.type === TransactionType.Expense)
      .reduce((sum, t) => sum + t.amount, 0);

    const summary: Summary = {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      totalTransactions: filtered.length,
      periodStart: startDate || '2025-01-01',
      periodEnd: endDate || '2025-12-31'
    };

    return of(summary);
  }

  private getCategoryName(categoryId: number): string {
    const categories: { [key: number]: string } = {
      1: 'Alimentação',
      2: 'Transporte',
      3: 'Moradia',
      4: 'Saúde',
      5: 'Educação',
      6: 'Entretenimento',
      7: 'Salário',
      8: 'Freelance',
      9: 'Investimentos',
      10: 'Outros'
    };
    return categories[categoryId] || 'Outros';
  }
}