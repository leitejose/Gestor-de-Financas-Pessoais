import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';

import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import { Transaction, CreateTransaction, TransactionType, Category } from '../../models/finance.models';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,

    MatCardModule,
    MatToolbarModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule
  ],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnInit, OnDestroy {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  categories: Category[] = [];
  
  transactionForm: FormGroup;
  isEditMode = false;
  editingTransactionId: string | null = null;
  showForm = false;
  
  displayedColumns: string[] = ['date', 'description', 'category', 'type', 'amount', 'actions'];
  
  // Pagination
  pageSize = 10;
  pageIndex = 0;
  totalTransactions = 0;
  pagedTransactions: Transaction[] = [];
  
  // Filters
  filterType: TransactionType | '' = '';
  filterCategory: number | '' = '';
  filterDateFrom: string = '';
  filterDateTo: string = '';
  
  TransactionType = TransactionType;
  
  private destroy$ = new Subject<void>();

  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {
    this.transactionForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(3)]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      date: [this.formatDateForInput(new Date()), Validators.required],
      type: [TransactionType.Expense, Validators.required],
      categoryId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadTransactions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTransactions(): void {
    this.transactionService.getTransactions()
    .pipe(takeUntil(this.destroy$))
    .subscribe(transactions => {
      this.transactions = transactions;
      this.filteredTransactions = transactions;
      this.totalTransactions = transactions.length;
      this.updatePagedTransactions();
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => {
        this.categories = categories;
      });
  }

  updatePagedTransactions(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedTransactions = this.filteredTransactions.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePagedTransactions();
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.loadTransactions();
  }

  clearFilters(): void {
    this.filterType = '';
    this.filterCategory = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.applyFilters();
  }

  showAddForm(): void {
    this.isEditMode = false;
    this.editingTransactionId = null;
    this.transactionForm.reset({
      date: this.formatDateForInput(new Date()),
      type: TransactionType.Expense
    });
    this.showForm = true;
  }

  editTransaction(transaction: Transaction): void {
    this.isEditMode = true;
    this.editingTransactionId = transaction.id;
    this.transactionForm.patchValue({
      description: transaction.description,
      amount: transaction.amount,
      date: transaction.date,
      type: transaction.type,
      categoryId: transaction.categoryId
    });
    this.showForm = true;
  }

  submitTransaction(): void {
    if (this.transactionForm.valid) {
      const formValue = this.transactionForm.value;
      const transactionData: CreateTransaction = {
        description: formValue.description,
        amount: Number(formValue.amount),
        date: formValue.date,
        type: formValue.type,
        categoryId: formValue.categoryId
      };

      if (this.isEditMode && this.editingTransactionId) {
        this.transactionService.updateTransaction(this.editingTransactionId, transactionData)
          .pipe(takeUntil(this.destroy$))
          .subscribe(updatedTransaction => {
            if (updatedTransaction) {
              alert('Transação atualizada com sucesso!');
              this.loadTransactions();
              this.cancelForm();
            }
          });
      } else {
        this.transactionService.createTransaction(transactionData)
          .pipe(takeUntil(this.destroy$))
          .subscribe(newTransaction => {
            alert('Transação criada com sucesso!');
            this.loadTransactions();
            this.cancelForm();
          });
      }
    }
  }

  deleteTransaction(transaction: Transaction): void {
    if (confirm(`Tem certeza que deseja excluir a transação "${transaction.description}"?`)) {
      this.transactionService.deleteTransaction(transaction.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(success => {
          if (success) {
            alert('Transação excluída com sucesso!');
            this.loadTransactions();
          }
        });
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.isEditMode = false;
    this.editingTransactionId = null;
    this.transactionForm.reset();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatDisplayDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  getTransactionTypeClass(type: TransactionType): string {
    return type === TransactionType.Income ? 'income' : 'expense';
  }

  getTransactionTypeLabel(type: TransactionType): string {
    return type === TransactionType.Income ? 'Receita' : 'Despesa';
  }
}
