import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';

import { CategoryService } from '../../services/category.service';
import { Category, CategoryType } from '../../models/finance.models';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatToolbarModule
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  loading = false;
  isEditing = false;
  editingCategoryId: string | null = null;
  
  categoryForm: FormGroup;
  displayedColumns: string[] = ['name', 'type', 'description', 'actions'];
  
  categoryTypes = [
    { value: CategoryType.Income, label: 'Receita' },
    { value: CategoryType.Expense, label: 'Despesa' }
  ];
  
  private destroy$ = new Subject<void>();

  constructor(
    private categoryService: CategoryService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog
  ) {
    this.categoryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      type: [CategoryType.Expense, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar categorias:', error);
          this.showMessage('Erro ao carregar categorias');
          this.loading = false;
        }
      });
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      const categoryData = this.categoryForm.value;
      
      if (this.isEditing && this.editingCategoryId) {
        this.updateCategory(this.editingCategoryId, categoryData);
      } else {
        this.createCategory(categoryData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  createCategory(categoryData: Partial<Category>): void {
    const newCategory: Category = {
      id: '', // Supabase gerará o UUID
      name: categoryData.name!,
      description: categoryData.description || '',
      type: categoryData.type!,
      createdAt: new Date().toISOString(),
      transactionCount: 0
    };

    this.categoryService.createCategory(newCategory)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showMessage('Categoria criada com sucesso!');
          this.resetForm();
          this.loadCategories();
        },
        error: (error) => {
          console.error('Erro ao criar categoria:', error);
          this.showMessage('Erro ao criar categoria');
        }
      });
  }

  updateCategory(id: string, categoryData: Partial<Category>): void {
    const existingCategory = this.categories.find(c => c.id === id)!;
    const updatedCategory: Category = {
      ...existingCategory,
      ...categoryData,
      createdAt: existingCategory.createdAt
    };

    this.categoryService.updateCategory(id, updatedCategory)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showMessage('Categoria atualizada com sucesso!');
          this.resetForm();
          this.loadCategories();
        },
        error: (error) => {
          console.error('Erro ao atualizar categoria:', error);
          this.showMessage('Erro ao atualizar categoria');
        }
      });
  }

  editCategory(category: Category): void {
    this.isEditing = true;
    this.editingCategoryId = category.id;
    
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description,
      type: category.type
    });
    
    // Scroll para o formulário
    document.querySelector('.form-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  deleteCategory(category: Category): void {
    if (confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
      this.categoryService.deleteCategory(category.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showMessage('Categoria excluída com sucesso!');
            this.loadCategories();
          },
          error: (error) => {
            console.error('Erro ao excluir categoria:', error);
            this.showMessage('Erro ao excluir categoria');
          }
        });
    }
  }

  resetForm(): void {
    this.isEditing = false;
    this.editingCategoryId = null;
    this.categoryForm.reset({
      name: '',
      description: '',
      type: CategoryType.Expense
    });
    this.categoryForm.markAsUntouched();
  }

  getTypeLabel(type: CategoryType): string {
    return type === CategoryType.Income ? 'Receita' : 'Despesa';
  }

  getTypeClass(type: CategoryType): string {
    return type === CategoryType.Income ? 'income-type' : 'expense-type';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.categoryForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.categoryForm.get(fieldName);
    
    if (!field || !field.errors) return '';
    
    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} é obrigatório`;
    }
    
    if (field.errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} deve ter pelo menos ${field.errors['minlength'].requiredLength} caracteres`;
    }
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Nome',
      description: 'Descrição',
      type: 'Tipo'
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.categoryForm.controls).forEach(key => {
      const control = this.categoryForm.get(key);
      control?.markAsTouched();
    });
  }

  // generateId removido - Supabase gera UUIDs automaticamente

  private showMessage(message: string): void {
    alert(message);
  }

  // Métodos para estatísticas
  get totalCategories(): number {
    return this.categories.length;
  }

  get incomeCategories(): number {
    return this.categories.filter(c => c.type === CategoryType.Income).length;
  }

  get expenseCategories(): number {
    return this.categories.filter(c => c.type === CategoryType.Expense).length;
  }

  // Método para filtrar categorias
  getCategoriesByType(type: CategoryType): Category[] {
    return this.categories.filter(c => c.type === type);
  }
}