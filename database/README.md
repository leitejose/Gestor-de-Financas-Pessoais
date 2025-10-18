# 📊 Gestor de Finanças - Banco de Dados SQL Server

Este diretório contém os scripts SQL para configurar o banco de dados SQL Server do sistema Gestor de Finanças.

## 🗄️ Estrutura do Banco

### Tabelas Principais
- **Categories**: Categorias de transações (Alimentação, Transporte, etc.)
- **Transactions**: Transações financeiras (receitas e despesas)

### Views
- **vw_FinancialSummary**: Resumo financeiro por mês/ano
- **vw_TransactionsWithCategory**: Transações com informações da categoria

### Stored Procedures
- **sp_GetFinancialSummary**: Obter resumo financeiro por período
- **sp_GetTransactions**: Obter transações com filtros e paginação
- **sp_MonthlyReport**: Relatório mensal completo
- **sp_BackupTransactions**: Backup de transações

### Funções
- **fn_GetCurrentBalance()**: Saldo atual
- **fn_GetMonthlyExpensesByCategory()**: Gastos mensais por categoria
- **fn_GetMonthlyIncome()**: Receita mensal

## 🚀 Como Configurar

### 1. Pré-requisitos
- SQL Server 2019 ou superior
- SQL Server Management Studio (SSMS) ou Azure Data Studio
- Permissões para criar banco de dados

### 2. Executar Scripts
Execute os scripts na seguinte ordem:

```sql
-- 1. Criar banco e estrutura inicial
sqlcmd -S your_server -i 01_create_database.sql

-- 2. Adicionar triggers e funções
sqlcmd -S your_server -i 02_triggers_functions.sql
```

### 3. Via SSMS
1. Abra o SQL Server Management Studio
2. Conecte-se ao seu servidor SQL Server
3. Execute o script `01_create_database.sql`
4. Execute o script `02_triggers_functions.sql`

## 📋 Dados de Exemplo

O banco é criado com:
- **10 categorias padrão** (Alimentação, Transporte, Moradia, etc.)
- **18 transações de exemplo** para demonstração
- **Dados realistas** para teste da aplicação

## 🔐 String de Conexão

Exemplo de string de conexão para aplicações:

```
Server=localhost;Database=GestorFinancas;Trusted_Connection=true;
```

Para SQL Server Express:
```
Server=localhost\\SQLEXPRESS;Database=GestorFinancas;Trusted_Connection=true;
```

Para autenticação SQL:
```
Server=localhost;Database=GestorFinancas;User Id=seu_usuario;Password=sua_senha;
```

## 🔍 Consultas Úteis

### Verificar Saldo Atual
```sql
SELECT dbo.fn_GetCurrentBalance() as SaldoAtual;
```

### Resumo do Mês Atual
```sql
EXEC sp_GetFinancialSummary;
```

### Relatório Mensal
```sql
EXEC sp_MonthlyReport @Month = 10, @Year = 2025;
```

### Top 10 Gastos
```sql
SELECT TOP 10 * FROM vw_TransactionsWithCategory 
WHERE TransactionType = 0 
ORDER BY Amount DESC;
```

## 📊 Estrutura das Tabelas

### Categories
| Campo | Tipo | Descrição |
|-------|------|-----------|
| Id | INT | ID único da categoria |
| Name | NVARCHAR(100) | Nome da categoria |
| Description | NVARCHAR(500) | Descrição detalhada |
| Color | NVARCHAR(7) | Cor em hexadecimal |
| Icon | NVARCHAR(50) | Nome do ícone Material |
| IsActive | BIT | Categoria ativa |
| CreatedAt | DATETIME2 | Data de criação |
| UpdatedAt | DATETIME2 | Data de atualização |

### Transactions
| Campo | Tipo | Descrição |
|-------|------|-----------|
| Id | INT | ID único da transação |
| Description | NVARCHAR(500) | Descrição da transação |
| Amount | DECIMAL(18,2) | Valor da transação |
| TransactionDate | DATE | Data da transação |
| TransactionType | TINYINT | Tipo (0=Despesa, 1=Receita) |
| CategoryId | INT | ID da categoria |
| Notes | NVARCHAR(1000) | Observações |
| CreatedAt | DATETIME2 | Data de criação |
| UpdatedAt | DATETIME2 | Data de atualização |

## 🛠️ Manutenção

### Backup Regular
```sql
EXEC sp_BackupTransactions;
```

### Limpeza de Dados Antigos
```sql
-- Remover transações antigas (exemplo: mais de 2 anos)
DELETE FROM Transactions 
WHERE TransactionDate < DATEADD(YEAR, -2, GETDATE());
```

### Reindexação
```sql
-- Reindexar tabelas para performance
ALTER INDEX ALL ON Categories REBUILD;
ALTER INDEX ALL ON Transactions REBUILD;
```

## 📈 Performance

- Índices criados em campos frequentemente consultados
- Views otimizadas para relatórios
- Stored procedures para operações complexas
- Triggers para manter integridade dos dados

## 🚨 Troubleshooting

### Erro: "Cannot find database"
Execute o script de criação novamente.

### Erro: "Permission denied"
Verifique se o usuário tem permissões de CREATE DATABASE.

### Performance lenta
Execute reindexação das tabelas.

---

💡 **Dica**: Mantenha backups regulares e monitore o crescimento do banco de dados!
