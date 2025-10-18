import { Injectable } from '@angular/core';
import { Observable, from, BehaviorSubject, map, catchError, of } from 'rxjs';
import { Category, CreateCategory, CategoryType } from '../models/finance.models';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  constructor(private supabaseService: SupabaseService) {
    this.loadCategories();
  }

  private async loadCategories() {
    try {
      const categories = await this.supabaseService.getCategories();
      const formattedCategories = categories.map(this.formatCategoryFromSupabase);
      this.categoriesSubject.next(formattedCategories);
    } catch (error) {
      this.categoriesSubject.next([]);
    }
  }

  private formatCategoryFromSupabase(supabaseCategory: any): Category {
    return {
      id: supabaseCategory.id,
      name: supabaseCategory.name,
      description: supabaseCategory.description || '',
      type: supabaseCategory.type === 'income' ? CategoryType.Income : CategoryType.Expense,
      createdAt: supabaseCategory.created_at,
      transactionCount: 0 // Será calculado separadamente se necessário
    };
  }

  private formatCategoryForSupabase(category: CreateCategory) {
    return {
      name: category.name,
      description: category.description,
      type: category.type === CategoryType.Income ? 'income' : 'expense',
      color: '#6366f1', // Cor padrão
      icon: 'category' // Ícone padrão
    };
  }

  getCategories(): Observable<Category[]> {
    return from(this.supabaseService.getCategories()).pipe(
      map(categories => categories.map(this.formatCategoryFromSupabase).sort((a, b) => a.name.localeCompare(b.name))),
      catchError(error => {
        return of([]);
      })
    );
  }

  getCategory(id: string): Observable<Category | undefined> {
    const categories = this.categoriesSubject.value;
    const category = categories.find(c => c.id === id);
    return of(category);
  }

  createCategory(category: CreateCategory): Observable<Category> {
    const supabaseCategory = this.formatCategoryForSupabase(category);
    
    return from(this.supabaseService.createCategory(supabaseCategory)).pipe(
      map(createdCategory => {
        const newCategory = this.formatCategoryFromSupabase(createdCategory);
        const currentCategories = this.categoriesSubject.value;
        this.categoriesSubject.next([...currentCategories, newCategory]);
        return newCategory;
      }),
      catchError(error => {
        throw error;
      })
    );
  }

  updateCategory(id: string, category: CreateCategory): Observable<Category | undefined> {
    const updates = this.formatCategoryForSupabase(category);
    
    return from(this.supabaseService.updateCategory(id, updates)).pipe(
      map(updatedCategory => {
        const formattedCategory = this.formatCategoryFromSupabase(updatedCategory);
        const currentCategories = this.categoriesSubject.value;
        const index = currentCategories.findIndex(c => c.id === id);
        
        if (index !== -1) {
          currentCategories[index] = formattedCategory;
          this.categoriesSubject.next([...currentCategories]);
        }
        
        return formattedCategory;
      }),
      catchError(error => {
        return of(undefined);
      })
    );
  }

  deleteCategory(id: string): Observable<boolean> {
    return from(this.supabaseService.deleteCategory(id)).pipe(
      map(() => {
        const currentCategories = this.categoriesSubject.value;
        const filteredCategories = currentCategories.filter(c => c.id !== id);
        this.categoriesSubject.next(filteredCategories);
        return true;
      }),
      catchError(error => {
        if (error.message.includes('violates foreign key constraint')) {
          throw new Error('Não é possível excluir uma categoria que possui transações associadas.');
        }
        return of(false);
      })
    );
  }

  // Método para forçar o reload das categorias
  refreshCategories(): void {
    this.loadCategories();
  }
}
