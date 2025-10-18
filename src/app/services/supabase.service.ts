import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient | null = null;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Só inicializa o Supabase no browser
    if (this.isBrowser) {
      this.supabase = createClient(
        environment.supabaseUrl,
        environment.supabaseAnonKey
      );
    }
  }

  get client() {
    return this.supabase;
  }

  // Métodos para Categorias
  async getCategories() {
    if (!this.isBrowser || !this.supabase) {
      throw new Error('Supabase not available in SSR');
    }
    
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  }

  async createCategory(category: any) {
    if (!this.isBrowser || !this.supabase) {
      throw new Error('Supabase not available in SSR');
    }
    
    const { data, error } = await this.supabase
      .from('categories')
      .insert([category])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateCategory(id: string, updates: any) {
    if (!this.isBrowser || !this.supabase) {
      throw new Error('Supabase not available in SSR');
    }
    
    const { data, error } = await this.supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteCategory(id: string) {
    if (!this.isBrowser || !this.supabase) {
      throw new Error('Supabase not available in SSR');
    }
    
    const { error } = await this.supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Métodos para Transações
  async getTransactions() {
    if (!this.isBrowser || !this.supabase) {
      throw new Error('Supabase not available in SSR');
    }
    
    const { data, error } = await this.supabase
      .from('transactions')
      .select(`
        *,
        categories (
          id,
          name,
          color,
          icon,
          type
        )
      `)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async createTransaction(transaction: any) {
    if (!this.isBrowser || !this.supabase) {
      throw new Error('Supabase not available in SSR');
    }
    
    const { data, error } = await this.supabase
      .from('transactions')
      .insert([transaction])
      .select(`
        *,
        categories (
          id,
          name,
          color,
          icon,
          type
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateTransaction(id: string, updates: any) {
    if (!this.isBrowser || !this.supabase) {
      throw new Error('Supabase not available in SSR');
    }
    
    const { data, error } = await this.supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        categories (
          id,
          name,
          color,
          icon,
          type
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteTransaction(id: string) {
    if (!this.isBrowser || !this.supabase) {
      throw new Error('Supabase not available in SSR');
    }
    
    const { error } = await this.supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Métodos para Estatísticas e Relatórios
  async getTransactionsByDateRange(startDate: string, endDate: string) {
    if (!this.isBrowser || !this.supabase) {
      throw new Error('Supabase not available in SSR');
    }
    
    const { data, error } = await this.supabase
      .from('transactions')
      .select(`
        *,
        categories (
          id,
          name,
          color,
          icon,
          type
        )
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async getTransactionsByCategory(categoryId: string) {
    if (!this.isBrowser || !this.supabase) {
      throw new Error('Supabase not available in SSR');
    }
    
    const { data, error } = await this.supabase
      .from('transactions')
      .select(`
        *,
        categories (
          id,
          name,
          color,
          icon,
          type
        )
      `)
      .eq('category_id', categoryId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async getMonthlyStatistics(year: number, month: number) {
    if (!this.isBrowser || !this.supabase) {
      throw new Error('Supabase not available in SSR');
    }
    
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
    
    const { data, error } = await this.supabase
      .from('transactions')
      .select('amount, type')
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (error) throw error;
    
    const income = data?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const expenses = data?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) || 0;
    
    return {
      income,
      expenses,
      balance: income - expenses,
      transactionCount: data?.length || 0
    };
  }
}