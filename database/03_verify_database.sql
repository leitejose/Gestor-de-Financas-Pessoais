-- ====================================
-- GESTOR DE FINANÇAS - VERIFICAR BANCO
-- ====================================

USE GestorFinancas;
GO

-- Verificar se as tabelas existem
SELECT 'Tabelas do Sistema' as Verificacao;
SELECT 
    TABLE_NAME as NomeTabela,
    (SELECT COUNT(*) FROM Categories WHERE TABLE_NAME = 'Categories') as QuantidadeCategorias,
    (SELECT COUNT(*) FROM Transactions WHERE TABLE_NAME = 'Transactions') as QuantidadeTransacoes
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- Verificar views
SELECT 'Views do Sistema' as Verificacao;
SELECT TABLE_NAME as NomeView
FROM INFORMATION_SCHEMA.VIEWS
ORDER BY TABLE_NAME;

-- Verificar stored procedures
SELECT 'Stored Procedures do Sistema' as Verificacao;
SELECT 
    ROUTINE_NAME as NomeProcedure,
    ROUTINE_TYPE as Tipo
FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_TYPE = 'PROCEDURE'
ORDER BY ROUTINE_NAME;

-- Verificar functions
SELECT 'Functions do Sistema' as Verificacao;
SELECT 
    ROUTINE_NAME as NomeFunction,
    ROUTINE_TYPE as Tipo
FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_TYPE = 'FUNCTION'
ORDER BY ROUTINE_NAME;

-- Verificar dados das tabelas
SELECT 'Resumo dos Dados' as Verificacao;
SELECT 'Categories' as Tabela, COUNT(*) as Total FROM Categories
UNION ALL
SELECT 'Transactions', COUNT(*) FROM Transactions;

-- Verificar categorias ativas
SELECT 'Categorias Ativas' as Verificacao;
SELECT Id, Name, Color, Icon FROM Categories WHERE IsActive = 1 ORDER BY Name;

-- Verificar transações recentes
SELECT 'Últimas 5 Transações' as Verificacao;
SELECT TOP 5
    t.Id,
    t.Description,
    t.Amount,
    t.TransactionDate,
    CASE WHEN t.TransactionType = 1 THEN 'Receita' ELSE 'Despesa' END as Tipo,
    c.Name as Categoria
FROM Transactions t
INNER JOIN Categories c ON t.CategoryId = c.Id
ORDER BY t.TransactionDate DESC, t.CreatedAt DESC;

-- Verificar saldo atual
SELECT 'Resumo Financeiro' as Verificacao;
SELECT 
    SUM(CASE WHEN TransactionType = 1 THEN Amount ELSE 0 END) as TotalReceitas,
    SUM(CASE WHEN TransactionType = 0 THEN Amount ELSE 0 END) as TotalDespesas,
    SUM(CASE WHEN TransactionType = 1 THEN Amount ELSE -Amount END) as SaldoAtual,
    COUNT(*) as TotalTransacoes
FROM Transactions;

-- Testar stored procedure
SELECT 'Teste da Stored Procedure' as Verificacao;
EXEC sp_GetFinancialSummary;

PRINT 'Verificação completa do banco de dados finalizada!';