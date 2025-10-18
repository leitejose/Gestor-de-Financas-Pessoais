import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import { Transaction, TransactionType, Category } from '../../models/finance.models';
import { Subject, takeUntil, forkJoin } from 'rxjs';

// Registrar Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    BaseChartDirective
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit, OnDestroy {
  transactions: Transaction[] = [];
  categories: Category[] = [];
  loading = true;
  
  selectedPeriod = 'current-month';
  Math = Math;
  
  private destroy$ = new Subject<void>();

  // Dados dos gráficos
  incomeVsExpenseData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Receitas', 'Despesas'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#4CAF50', '#f44336'],
      borderColor: ['#4CAF50', '#f44336'],
      borderWidth: 2
    }]
  };

  categoryExpensesData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#FF6384',
        '#C9CBCF',
        '#4BC0C0',
        '#FF6384'
      ],
      borderWidth: 2
    }]
  };

  monthlyTrendData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Receitas',
        data: [],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4
      },
      {
        label: 'Despesas',
        data: [],
        borderColor: '#f44336',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        tension: 0.4
      }
    ]
  };

  categoryComparisonData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Receitas',
        data: [],
        backgroundColor: 'rgba(76, 175, 80, 0.7)',
        borderColor: '#4CAF50',
        borderWidth: 2
      },
      {
        label: 'Despesas',
        data: [],
        backgroundColor: 'rgba(244, 67, 54, 0.7)',
        borderColor: '#f44336',
        borderWidth: 2
      }
    ]
  };

  weeklyDistributionData: ChartConfiguration<'radar'>['data'] = {
    labels: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    datasets: [
      {
        label: 'Receitas',
        data: [],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        pointBackgroundColor: '#4CAF50',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#4CAF50'
      },
      {
        label: 'Despesas',
        data: [],
        borderColor: '#f44336',
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
        pointBackgroundColor: '#f44336',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#f44336'
      }
    ]
  };

  yearlyGrowthData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Crescimento das Receitas (%)',
        data: [],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Variação das Despesas (%)',
        data: [],
        borderColor: '#f44336',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  dailyAverageData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    datasets: [
      {
        label: 'Média de Gastos por Dia',
        data: [],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384'
        ],
        borderColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384'
        ],
        borderWidth: 2
      }
    ]
  };

  cumulativeEvolutionData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Receitas Acumuladas',
        data: [],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.3)',
        tension: 0.4,
        fill: '+1'
      },
      {
        label: 'Despesas Acumuladas',
        data: [],
        borderColor: '#f44336',
        backgroundColor: 'rgba(244, 67, 54, 0.3)',
        tension: 0.4,
        fill: 'origin'
      },
      {
        label: 'Saldo Acumulado',
        data: [],
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        tension: 0.4,
        fill: false,
        borderWidth: 3
      }
    ]
  };

  // Configurações dos gráficos
  incomeVsExpenseOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      },
      title: {
        display: true,
        text: 'Receitas vs Despesas'
      }
    }
  };

  categoryExpensesOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right'
      },
      title: {
        display: true,
        text: 'Despesas por Categoria'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': R$ ' + Number(context.raw).toLocaleString('pt-BR');
          }
        }
      }
    }
  };

  monthlyTrendOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Tendência Mensal'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'R$ ' + Number(value).toLocaleString('pt-BR');
          }
        }
      }
    }
  };

  categoryComparisonOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Comparação por Categoria'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'R$ ' + Number(value).toLocaleString('pt-BR');
          }
        }
      }
    }
  };

  weeklyDistributionOptions: ChartConfiguration<'radar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Distribuição Semanal'
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'R$ ' + Number(value).toLocaleString('pt-BR');
          }
        }
      }
    }
  };

  yearlyGrowthOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Crescimento Anual (%)'
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value) {
            return Number(value).toFixed(1) + '%';
          }
        }
      }
    }
  };

  dailyAverageOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Média de Gastos por Dia da Semana'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'R$ ' + Number(value).toLocaleString('pt-BR');
          }
        }
      }
    }
  };

  cumulativeEvolutionOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Evolução Acumulada das Finanças'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'R$ ' + Number(value).toLocaleString('pt-BR');
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  };

  // Tipos dos gráficos
  incomeVsExpenseType: 'doughnut' = 'doughnut';
  categoryExpensesType: 'pie' = 'pie';
  monthlyTrendType: 'line' = 'line';
  categoryComparisonType: 'bar' = 'bar';
  weeklyDistributionType: 'radar' = 'radar';
  yearlyGrowthType: 'line' = 'line';
  dailyAverageType: 'bar' = 'bar';
  cumulativeEvolutionType: 'line' = 'line';

  // Resumo financeiro
  summary = {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0
  };

  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.loading = true;
    
    forkJoin({
      transactions: this.transactionService.getTransactions(),
      categories: this.categoryService.getCategories()
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.transactions = data.transactions;
        this.categories = data.categories;
        this.generateCharts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dados:', error);
        this.loading = false;
      }
    });
  }

  onPeriodChange(): void {
    this.generateCharts();
  }

  private generateCharts(): void {
    const filteredTransactions = this.getFilteredTransactions();
    
    this.generateIncomeVsExpenseChart(filteredTransactions);
    this.generateCategoryExpensesChart(filteredTransactions);
    this.generateMonthlyTrendChart();
    this.generateCategoryComparisonChart();
    this.generateWeeklyDistributionChart();
    this.generateYearlyGrowthChart();
    this.generateDailyAverageChart();
    this.generateCumulativeEvolutionChart();
    this.calculateSummary(filteredTransactions);
  }

  private getFilteredTransactions(): Transaction[] {
    const now = new Date();
    let startDate: Date;

    switch (this.selectedPeriod) {
      case 'current-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last-3-months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'last-6-months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case 'current-year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all-time':
      default:
        return this.transactions;
    }

    return this.transactions.filter(t => new Date(t.date) >= startDate);
  }

  private generateIncomeVsExpenseChart(transactions: Transaction[]): void {
    const totalIncome = transactions
      .filter(t => t.type === TransactionType.Income)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === TransactionType.Expense)
      .reduce((sum, t) => sum + t.amount, 0);

    this.incomeVsExpenseData = {
      labels: ['Receitas', 'Despesas'],
      datasets: [{
        data: [totalIncome, totalExpenses],
        backgroundColor: ['#4CAF50', '#f44336'],
        borderColor: ['#4CAF50', '#f44336'],
        borderWidth: 2
      }]
    };
  }

  private generateCategoryExpensesChart(transactions: Transaction[]): void {
    const expenses = transactions.filter(t => t.type === TransactionType.Expense);
    const categoryTotals = new Map<string, number>();

    expenses.forEach(transaction => {
      const categoryName = transaction.categoryName || 'Outros';
      categoryTotals.set(categoryName, (categoryTotals.get(categoryName) || 0) + transaction.amount);
    });

    const sortedCategories = Array.from(categoryTotals.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    this.categoryExpensesData = {
      labels: sortedCategories.map(([name]) => name),
      datasets: [{
        data: sortedCategories.map(([, total]) => total),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
        ],
        borderWidth: 2
      }]
    };
  }

  private generateMonthlyTrendChart(): void {
    const monthlyData = new Map<string, { income: number, expenses: number }>();
    const now = new Date();
    
    // Gerar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      monthlyData.set(monthKey, { income: 0, expenses: 0 });
    }

    this.transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const monthKey = transactionDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      if (monthlyData.has(monthKey)) {
        const data = monthlyData.get(monthKey)!;
        if (transaction.type === TransactionType.Income) {
          data.income += transaction.amount;
        } else {
          data.expenses += transaction.amount;
        }
      }
    });

    const labels = Array.from(monthlyData.keys());
    const incomeData = Array.from(monthlyData.values()).map(d => d.income);
    const expensesData = Array.from(monthlyData.values()).map(d => d.expenses);

    this.monthlyTrendData = {
      labels,
      datasets: [
        {
          label: 'Receitas',
          data: incomeData,
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Despesas',
          data: expensesData,
          borderColor: '#f44336',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  }

  private generateCategoryComparisonChart(): void {
    const categoryMap = new Map<string, { income: number, expenses: number }>();
    
    this.categories.forEach(category => {
      categoryMap.set(category.name, { income: 0, expenses: 0 });
    });

    this.transactions.forEach(transaction => {
      const categoryName = transaction.categoryName || 'Outros';
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, { income: 0, expenses: 0 });
      }
      
      const data = categoryMap.get(categoryName)!;
      if (transaction.type === TransactionType.Income) {
        data.income += transaction.amount;
      } else {
        data.expenses += transaction.amount;
      }
    });

    const labels = Array.from(categoryMap.keys());
    const incomeData = Array.from(categoryMap.values()).map(d => d.income);
    const expensesData = Array.from(categoryMap.values()).map(d => d.expenses);

    this.categoryComparisonData = {
      labels,
      datasets: [
        {
          label: 'Receitas',
          data: incomeData,
          backgroundColor: 'rgba(76, 175, 80, 0.7)',
          borderColor: '#4CAF50',
          borderWidth: 2
        },
        {
          label: 'Despesas',
          data: expensesData,
          backgroundColor: 'rgba(244, 67, 54, 0.7)',
          borderColor: '#f44336',
          borderWidth: 2
        }
      ]
    };
  }

  private generateWeeklyDistributionChart(): void {
    const weeklyIncome = [0, 0, 0, 0, 0, 0, 0];
    const weeklyExpenses = [0, 0, 0, 0, 0, 0, 0];

    this.transactions.forEach(transaction => {
      const dayOfWeek = new Date(transaction.date).getDay();
      if (transaction.type === TransactionType.Income) {
        weeklyIncome[dayOfWeek] += transaction.amount;
      } else {
        weeklyExpenses[dayOfWeek] += transaction.amount;
      }
    });

    this.weeklyDistributionData = {
      labels: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
      datasets: [
        {
          label: 'Receitas',
          data: weeklyIncome,
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          pointBackgroundColor: '#4CAF50',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#4CAF50'
        },
        {
          label: 'Despesas',
          data: weeklyExpenses,
          borderColor: '#f44336',
          backgroundColor: 'rgba(244, 67, 54, 0.2)',
          pointBackgroundColor: '#f44336',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#f44336'
        }
      ]
    };
  }

  private generateYearlyGrowthChart(): void {
    const yearlyData = new Map<number, { income: number, expenses: number }>();
    const currentYear = new Date().getFullYear();
    
    // Últimos 3 anos
    for (let i = 2; i >= 0; i--) {
      yearlyData.set(currentYear - i, { income: 0, expenses: 0 });
    }

    this.transactions.forEach(transaction => {
      const year = new Date(transaction.date).getFullYear();
      if (yearlyData.has(year)) {
        const data = yearlyData.get(year)!;
        if (transaction.type === TransactionType.Income) {
          data.income += transaction.amount;
        } else {
          data.expenses += transaction.amount;
        }
      }
    });

    const years = Array.from(yearlyData.keys()).sort();
    const incomeGrowth: number[] = [];
    const expensesGrowth: number[] = [];

    for (let i = 1; i < years.length; i++) {
      const currentYear = yearlyData.get(years[i])!;
      const previousYear = yearlyData.get(years[i - 1])!;
      
      const incomeGrowthRate = previousYear.income > 0 
        ? ((currentYear.income - previousYear.income) / previousYear.income) * 100
        : 0;
      
      const expensesGrowthRate = previousYear.expenses > 0
        ? ((currentYear.expenses - previousYear.expenses) / previousYear.expenses) * 100
        : 0;

      incomeGrowth.push(incomeGrowthRate);
      expensesGrowth.push(expensesGrowthRate);
    }

    this.yearlyGrowthData = {
      labels: years.slice(1).map(year => year.toString()),
      datasets: [
        {
          label: 'Crescimento das Receitas (%)',
          data: incomeGrowth,
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Variação das Despesas (%)',
          data: expensesGrowth,
          borderColor: '#f44336',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  }

  private generateDailyAverageChart(): void {
    const dailyTotals = [0, 0, 0, 0, 0, 0, 0]; // Dom a Sáb
    const dailyCounts = [0, 0, 0, 0, 0, 0, 0];

    this.transactions
      .filter(t => t.type === TransactionType.Expense)
      .forEach(transaction => {
        const dayOfWeek = new Date(transaction.date).getDay();
        dailyTotals[dayOfWeek] += transaction.amount;
        dailyCounts[dayOfWeek]++;
      });

    const dailyAverages = dailyTotals.map((total, index) => 
      dailyCounts[index] > 0 ? total / dailyCounts[index] : 0
    );

    this.dailyAverageData = {
      labels: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
      datasets: [
        {
          label: 'Média de Gastos por Dia',
          data: dailyAverages,
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#FF6384'
          ],
          borderColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#FF6384'
          ],
          borderWidth: 2
        }
      ]
    };
  }

  private generateCumulativeEvolutionChart(): void {
    const monthlyData = new Map<string, { income: number, expenses: number }>();
    const now = new Date();
    
    // Gerar últimos 12 meses
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      monthlyData.set(monthKey, { income: 0, expenses: 0 });
    }

    this.transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const monthKey = transactionDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      if (monthlyData.has(monthKey)) {
        const data = monthlyData.get(monthKey)!;
        if (transaction.type === TransactionType.Income) {
          data.income += transaction.amount;
        } else {
          data.expenses += transaction.amount;
        }
      }
    });

    const labels = Array.from(monthlyData.keys());
    const monthlyIncomes = Array.from(monthlyData.values()).map(d => d.income);
    const monthlyExpenses = Array.from(monthlyData.values()).map(d => d.expenses);
    
    // Calcular valores acumulados
    const cumulativeIncome: number[] = [];
    const cumulativeExpenses: number[] = [];
    const cumulativeBalance: number[] = [];
    
    let incomeSum = 0;
    let expensesSum = 0;
    
    for (let i = 0; i < monthlyIncomes.length; i++) {
      incomeSum += monthlyIncomes[i];
      expensesSum += monthlyExpenses[i];
      
      cumulativeIncome.push(incomeSum);
      cumulativeExpenses.push(expensesSum);
      cumulativeBalance.push(incomeSum - expensesSum);
    }

    this.cumulativeEvolutionData = {
      labels,
      datasets: [
        {
          label: 'Receitas Acumuladas',
          data: cumulativeIncome,
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.3)',
          tension: 0.4,
          fill: '+1'
        },
        {
          label: 'Despesas Acumuladas',
          data: cumulativeExpenses,
          borderColor: '#f44336',
          backgroundColor: 'rgba(244, 67, 54, 0.3)',
          tension: 0.4,
          fill: 'origin'
        },
        {
          label: 'Saldo Acumulado',
          data: cumulativeBalance,
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4,
          fill: false,
          borderWidth: 3
        }
      ]
    };
  }

  private calculateSummary(transactions: Transaction[]): void {
    const totalIncome = transactions
      .filter(t => t.type === TransactionType.Income)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === TransactionType.Expense)
      .reduce((sum, t) => sum + t.amount, 0);

    this.summary = {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount: transactions.length
    };
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  exportChart(chartType: string): void {
    alert(`Exportar gráfico ${chartType} - Funcionalidade em desenvolvimento`);
  }
}