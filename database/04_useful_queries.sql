-- ====================================
-- GESTOR DE FINANÇAS - CONSULTAS ÚTEIS
-- ====================================

USE GestorFinancas;
GO

-- 1. CONSULTAS BÁSICAS
-- ====================

-- Ver todas as categorias
SELECT * FROM Categories ORDER BY Name;

-- Ver todas as transações com categoria
SELECT * FROM vw_TransactionsWithCategory ORDER BY TransactionDate DESC;

-- 2. CONSULTAS DE RELATÓRIO
-- =========================

-- Resumo mensal atual
SELECT * FROM vw_FinancialSummary 
WHERE Year = YEAR(GETDATE()) AND Month = MONTH(GETDATE());

-- Top 5 maiores despesas
SELECT TOP 5 * FROM vw_TransactionsWithCategory 
WHERE TransactionType = 0 
ORDER BY Amount DESC;

-- Top 5 maiores receitas
SELECT TOP 5 * FROM vw_TransactionsWithCategory 
WHERE TransactionType = 1 
ORDER BY Amount DESC;

-- Gastos por categoria (mês atual)
SELECT 
    c.Name as Categoria,
    c.Color,
    c.Icon,
    SUM(t.Amount) as TotalGasto,
    COUNT(t.Id) as NumeroTransacoes
FROM Categories c
LEFT JOIN Transactions t ON c.Id = t.CategoryId 
    AND t.TransactionType = 0 
    AND MONTH(t.TransactionDate) = MONTH(GETDATE())
    AND YEAR(t.TransactionDate) = YEAR(GETDATE())
WHERE c.IsActive = 1
GROUP BY c.Id, c.Name, c.Color, c.Icon
ORDER BY TotalGasto DESC;

-- 3. CONSULTAS COM FILTROS
-- ========================

-- Transações do mês atual
SELECT * FROM vw_TransactionsWithCategory
WHERE MONTH(TransactionDate) = MONTH(GETDATE())
  AND YEAR(TransactionDate) = YEAR(GETDATE())
ORDER BY TransactionDate DESC;

-- Transações por categoria específica (exemplo: Alimentação)
SELECT * FROM vw_TransactionsWithCategory
WHERE CategoryName = 'Alimentação'
ORDER BY TransactionDate DESC;

-- Transações acima de R$ 100
SELECT * FROM vw_TransactionsWithCategory
WHERE Amount > 100
ORDER BY Amount DESC;

-- 4. RELATÓRIOS AVANÇADOS
-- =======================

-- Evolução mensal (últimos 6 meses)
SELECT 
    Year,
    Month,
    TotalIncome as Receitas,
    TotalExpenses as Despesas,
    Balance as Saldo,
    TotalTransactions as QtdTransacoes
FROM vw_FinancialSummary
WHERE Year >= YEAR(DATEADD(MONTH, -6, GETDATE()))
ORDER BY Year DESC, Month DESC;

-- Média de gastos por categoria
SELECT 
    c.Name as Categoria,
    AVG(t.Amount) as MediaGasto,
    MIN(t.Amount) as MenorGasto,
    MAX(t.Amount) as MaiorGasto,
    COUNT(t.Id) as TotalTransacoes
FROM Categories c
INNER JOIN Transactions t ON c.Id = t.CategoryId
WHERE t.TransactionType = 0 AND c.IsActive = 1
GROUP BY c.Name
ORDER BY MediaGasto DESC;

-- 5. INSERIR DADOS DE TESTE
-- =========================

-- Inserir nova categoria (exemplo)
/*
INSERT INTO Categories (Name, Description, Color, Icon) 
VALUES ('Pets', 'Gastos com animais de estimação', '#8BC34A', 'pets');
*/

-- Inserir nova transação (exemplo)
/*
INSERT INTO Transactions (Description, Amount, TransactionDate, TransactionType, CategoryId, Notes)
VALUES ('Ração para cachorro', 89.90, GETDATE(), 0, 
        (SELECT Id FROM Categories WHERE Name = 'Pets'), 
        'Ração premium 15kg');
*/

-- 6. LIMPEZA E MANUTENÇÃO
-- =======================

-- Remover transações antigas (exemplo: mais de 2 anos)
/*
DELETE FROM Transactions 
WHERE TransactionDate < DATEADD(YEAR, -2, GETDATE());
*/

-- Desativar categoria (ao invés de deletar)
/*
UPDATE Categories 
SET IsActive = 0 
WHERE Name = 'NomeCategoria';
*/

-- Reativar categoria
/*
UPDATE Categories 
SET IsActive = 1 
WHERE Name = 'NomeCategoria';
*/

-- 7. BACKUP E EXPORTAÇÃO
-- ======================

-- Backup das transações em formato de INSERT
/*
SELECT 
    'INSERT INTO Transactions (Description, Amount, TransactionDate, TransactionType, CategoryId, Notes) VALUES (''' +
    Description + ''', ' + CAST(Amount AS VARCHAR(20)) + ', ''' + 
    CAST(TransactionDate AS VARCHAR(10)) + ''', ' + 
    CAST(TransactionType AS VARCHAR(1)) + ', ' + 
    CAST(CategoryId AS VARCHAR(10)) + ', ''' + 
    ISNULL(Notes, '') + ''');' as BackupScript
FROM Transactions
ORDER BY Id;
*/

PRINT 'Consultas úteis carregadas! Use as seções comentadas conforme necessário.';