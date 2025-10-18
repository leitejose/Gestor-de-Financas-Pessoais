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
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  public transactions$ = this.transactionsSubject.asObservable();

  constructor(private supabaseService: SupabaseService) {
    this.loadTransactions();
  }

  private async loadTransactions() {
    try {
      const transactions = await this.supabaseService.getTransactions();
      const formattedTransactions = transactions.map(this.formatTransactionFromSupabase);
      this.transactionsSubject.next(formattedTransactions);
    } catch (error) {
      this.transactionsSubject.next([]);
    }
  }

  private formatTransactionFromSupabase(supabaseTransaction: any): Transaction {
    return {
      id: supabaseTransaction.id,
      description: supabaseTransaction.description,
      amount: Math.abs(Number(supabaseTransaction.amount)),
      date: supabaseTransaction.date,
      type: supabaseTransaction.type === 'income' ? TransactionType.Income : TransactionType.Expense,
      categoryId: supabaseTransaction.category_id || '',
      categoryName: supabaseTransaction.categories?.name || 'Sem categoria',
      createdAt: supabaseTransaction.created_at
    };
  }

  private formatTransactionForSupabase(transaction: CreateTransaction) {
    const amount = transaction.type === TransactionType.Income ?
      Math.abs(transaction.amount) :
      -Math.abs(transaction.amount);

    return {
      description: transaction.description,
      amount: amount,
      date: transaction.date,
      type: transaction.type === TransactionType.Income ? 'income' : 'expense',
      category_id: transaction.categoryId
    };
  }

  getTransactions(): Observable<Transaction[]> {
    return from(this.supabaseService.getTransactions()).pipe(
      map(transactions => transactions.map(this.formatTransactionFromSupabase)),
      catchError(error => {
        return of([]);
      })
    );
  }

  getTransaction(id: string): Observable<Transaction | undefined> {
    const transactions = this.transactionsSubject.value;
    const transaction = transactions.find(t => t.id === id);
    return of(transaction);
  }

  createTransaction(transaction: CreateTransaction): Observable<Transaction> {
    const supabaseTransaction = this.formatTransactionForSupabase(transaction);

    return from(this.supabaseService.createTransaction(supabaseTransaction)).pipe(
      map(createdTransaction => {
        const newTransaction = this.formatTransactionFromSupabase(createdTransaction);
        const currentTransactions = this.transactionsSubject.value;
        this.transactionsSubject.next([newTransaction, ...currentTransactions]);
        return newTransaction;
      }),
      catchError(error => {
        throw error;
      })
    );
  }

  updateTransaction(id: string, transaction: CreateTransaction): Observable<Transaction | undefined> {
    const updates = this.formatTransactionForSupabase(transaction);

    return from(this.supabaseService.updateTransaction(id, updates)).pipe(
      map(updatedTransaction => {
        const formattedTransaction = this.formatTransactionFromSupabase(updatedTransaction);
        const currentTransactions = this.transactionsSubject.value;
        const index = currentTransactions.findIndex(t => t.id === id);

        if (index !== -1) {
          currentTransactions[index] = formattedTransaction;
          this.transactionsSubject.next([...currentTransactions]);
        }

        return formattedTransaction;
      }),
      catchError(error => {
        return of(undefined);
      })
    );
  }

  deleteTransaction(id: string): Observable<boolean> {
    return from(this.supabaseService.deleteTransaction(id)).pipe(
      map(() => {
        const currentTransactions = this.transactionsSubject.value;
        const filteredTransactions = currentTransactions.filter(t => t.id !== id);
        this.transactionsSubject.next(filteredTransactions);
        return true;
      }),
      catchError(error => {
        return of(false);
      })
    );
  }

  getTransactionsByCategory(categoryId: string): Observable<Transaction[]> {
    return from(this.supabaseService.getTransactionsByCategory(categoryId)).pipe(
      map(transactions => transactions.map(this.formatTransactionFromSupabase)),
      catchError(error => {
        return of([]);
      })
    );
  }

  getTransactionsByDateRange(startDate: string, endDate: string): Observable<Transaction[]> {
    return from(this.supabaseService.getTransactionsByDateRange(startDate, endDate)).pipe(
      map(transactions => transactions.map(this.formatTransactionFromSupabase)),
      catchError(error => {
        return of([]);
      })
    );
  }

  getSummary(startDate?: string, endDate?: string): Observable<Summary> {
    const transactions = this.transactionsSubject.value;

    let filteredTransactions = transactions;
    if (startDate && endDate) {
      filteredTransactions = transactions.filter(t =>
        t.date >= startDate && t.date <= endDate
      );
    }

    const totalIncome = filteredTransactions
      .filter(t => t.type === TransactionType.Income)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = filteredTransactions
      .filter(t => t.type === TransactionType.Expense)
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    const summary: Summary = {
      totalIncome,
      totalExpenses,
      balance,
      totalTransactions: filteredTransactions.length,
      periodStart: startDate || (filteredTransactions[0]?.date || ''),
      periodEnd: endDate || (filteredTransactions[filteredTransactions.length - 1]?.date || '')
    };

    return of(summary);
  }

  getMonthlyStatistics(year: number, month: number): Observable<any> {
    return from(this.supabaseService.getMonthlyStatistics(year, month)).pipe(
      catchError(error => {
        return of({
          income: 0,
          expenses: 0,
          balance: 0,
          transactionCount: 0
        });
      })
    );
  }

  // Método para forçar o reload das transações
  refreshTransactions(): void {
    this.loadTransactions();
  }
}
