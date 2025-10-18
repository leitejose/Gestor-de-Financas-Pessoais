import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { RouterModule } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { Summary, Transaction, TransactionType } from '../../models/finance.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    RouterModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  summary: Summary | null = null;
  recentTransactions: Transaction[] = [];
  loading = false;
  transactionTypes = TransactionType;

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    // Carregar resumo
    this.transactionService.getSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar resumo:', error);
        this.loading = false;
      }
    });

    // Carregar transações recentes (últimas 5)
    this.transactionService.getTransactions().subscribe({
      next: (data) => {
        this.recentTransactions = data.slice(0, 5);
      },
      error: (error) => {
        console.error('Erro ao carregar transações recentes:', error);
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  getBalanceClass(): string {
    if (!this.summary) return 'neutral';

    if (this.summary.balance > 0) return 'positive';
    if (this.summary.balance < 0) return 'negative';
    return 'neutral';
  }
}
