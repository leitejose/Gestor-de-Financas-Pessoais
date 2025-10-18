import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';

import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import { Transaction, CreateTransaction, TransactionType, Category } from '../../models/finance.models';
import { Subject, takeUntil } from 'rxjs';
import * as XLSX from 'xlsx';

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
    MatSnackBarModule,
    MatProgressBarModule,

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
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
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
  
  // Import
  isImporting = false;
  
  TransactionType = TransactionType;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar
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

  // Excel Import Methods
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.importFromExcel(file);
    }
  }

  importFromExcel(file: File): void {
    this.isImporting = true;
    
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        this.processExcelData(jsonData);
      } catch (error) {
        this.snackBar.open('Erro ao ler arquivo Excel', 'Fechar', { duration: 3000 });
      } finally {
        this.isImporting = false;
        // Reset file input
        this.fileInput.nativeElement.value = '';
      }
    };
    
    reader.readAsArrayBuffer(file);
  }

  processExcelData(data: any[]): void {
    if (data.length < 2) {
      this.snackBar.open('Arquivo deve conter pelo menos um cabeçalho e uma linha de dados', 'Fechar', { duration: 3000 });
      return;
    }

    const headers = data[0];
    const expectedHeaders = ['Data', 'Descrição', 'Valor', 'Tipo', 'Categoria'];
    
    // Verificar se os cabeçalhos estão corretos
    const hasValidHeaders = expectedHeaders.every(header => 
      headers.some((h: string) => h && h.toLowerCase().includes(header.toLowerCase()))
    );

    if (!hasValidHeaders) {
      this.snackBar.open(`Cabeçalhos inválidos. Esperado: ${expectedHeaders.join(', ')}`, 'Fechar', { duration: 5000 });
      return;
    }

    const transactions: CreateTransaction[] = [];
    const errors: string[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      try {
        const transaction = this.parseRowToTransaction(row, headers);
        if (transaction) {
          transactions.push(transaction);
        }
      } catch (error) {
        errors.push(`Linha ${i + 1}: ${error}`);
      }
    }

    if (errors.length > 0) {
      this.snackBar.open(`${errors.length} erros encontrados. Verificar formato dos dados.`, 'Fechar', { duration: 5000 });
    }

    if (transactions.length > 0) {
      this.importTransactions(transactions);
    }
  }

  parseRowToTransaction(row: any[], headers: string[]): CreateTransaction | null {
    const getColumnIndex = (columnName: string) => {
      return headers.findIndex(h => h && h.toLowerCase().includes(columnName.toLowerCase()));
    };

    const dateIndex = getColumnIndex('data');
    const descIndex = getColumnIndex('descrição');
    const valueIndex = getColumnIndex('valor');
    const typeIndex = getColumnIndex('tipo');
    const categoryIndex = getColumnIndex('categoria');

    if (dateIndex === -1 || descIndex === -1 || valueIndex === -1 || typeIndex === -1) {
      return null;
    }

    // Parse date
    let date = '';
    if (typeof row[dateIndex] === 'number') {
      // Excel date serial number
      const excelDate = new Date((row[dateIndex] - 25569) * 86400 * 1000);
      date = excelDate.toISOString().split('T')[0];
    } else if (typeof row[dateIndex] === 'string') {
      const parsedDate = new Date(row[dateIndex]);
      date = parsedDate.toISOString().split('T')[0];
    }

    // Parse type
    const typeStr = row[typeIndex]?.toString().toLowerCase();
    let type: TransactionType;
    if (typeStr.includes('receita') || typeStr.includes('entrada') || typeStr.includes('income')) {
      type = TransactionType.Income;
    } else {
      type = TransactionType.Expense;
    }

    // Find category
    const categoryName = row[categoryIndex]?.toString();
    let categoryId = '';
    if (categoryName) {
      const category = this.categories.find(c => 
        c.name.toLowerCase() === categoryName.toLowerCase()
      );
      if (category) {
        categoryId = category.id;
      } else {
        // Use first category of the same type as fallback
        const categoryType = type === TransactionType.Income ? 'income' : 'expense';
        const fallbackCategory = this.categories.find(c => c.type.toString() === categoryType);
        if (fallbackCategory) {
          categoryId = fallbackCategory.id;
        }
      }
    }

    return {
      description: row[descIndex]?.toString() || '',
      amount: Math.abs(Number(row[valueIndex]) || 0),
      date: date,
      type: type,
      categoryId: categoryId
    };
  }

  async importTransactions(transactions: CreateTransaction[]): Promise<void> {
    let imported = 0;
    let failed = 0;

    for (const transaction of transactions) {
      try {
        await this.transactionService.createTransaction(transaction).toPromise();
        imported++;
      } catch (error) {
        failed++;
      }
    }

    this.snackBar.open(
      `Importação concluída! ${imported} transações importadas, ${failed} falharam.`,
      'Fechar',
      { duration: 5000 }
    );

    if (imported > 0) {
      this.loadTransactions();
    }
  }

  downloadTemplate(): void {
    const template = [
      ['Data', 'Descrição', 'Valor', 'Tipo', 'Categoria'],
      ['2024-01-15', 'Compras no supermercado', 150.50, 'Despesa', 'Alimentação'],
      ['2024-01-16', 'Salário mensal', 3000.00, 'Receita', 'Salário'],
      ['2024-01-17', 'Conta de luz', 120.00, 'Despesa', 'Moradia'],
      ['2024-01-18', 'Uber para o trabalho', 25.00, 'Despesa', 'Transporte'],
      ['2024-01-19', 'Freelance website', 500.00, 'Receita', 'Freelances'],
      ['2024-01-20', 'Cinema com a família', 60.00, 'Despesa', 'Lazer']
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transações');
    
    // Style the header
    const range = XLSX.utils.decode_range(ws['!ref'] || '');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "667eea" } }
      };
    }
    
    XLSX.writeFile(wb, 'modelo_transacoes.xlsx');
    
    this.snackBar.open('Modelo baixado com sucesso!', 'Fechar', { duration: 3000 });
  }
}
