-- ====================================
-- GESTOR DE FINANÇAS - TRIGGERS E FUNÇÕES
-- ====================================

USE GestorFinancas;
GO

-- ====================================
-- TRIGGER PARA ATUALIZAR UpdatedAt
-- ====================================
CREATE TRIGGER tr_Categories_UpdatedAt
ON Categories
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Categories
    SET UpdatedAt = GETDATE()
    FROM Categories c
    INNER JOIN inserted i ON c.Id = i.Id;
END;

GO

CREATE TRIGGER tr_Transactions_UpdatedAt
ON Transactions
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Transactions
    SET UpdatedAt = GETDATE()
    FROM Transactions t
    INNER JOIN inserted i ON t.Id = i.Id;
END;

GO

-- ====================================
-- FUNÇÕES ÚTEIS
-- ====================================

-- Função para obter saldo atual
CREATE FUNCTION fn_GetCurrentBalance()
RETURNS DECIMAL(18,2)
AS
BEGIN
    DECLARE @Balance DECIMAL(18,2);

    SELECT @Balance = SUM(
        CASE
            WHEN TransactionType = 1 THEN Amount
            ELSE -Amount
        END
    )
    FROM Transactions;

    RETURN ISNULL(@Balance, 0);
END;

GO

-- Função para obter total de gastos por categoria no mês
CREATE FUNCTION fn_GetMonthlyExpensesByCategory(@Month INT, @Year INT)
RETURNS TABLE
AS
RETURN
(
    SELECT
        c.Id as CategoryId,
        c.Name as CategoryName,
        c.Color as CategoryColor,
        c.Icon as CategoryIcon,
        SUM(t.Amount) as TotalAmount,
        COUNT(t.Id) as TransactionCount
    FROM Categories c
    LEFT JOIN Transactions t ON c.Id = t.CategoryId
        AND t.TransactionType = 0
        AND MONTH(t.TransactionDate) = @Month
        AND YEAR(t.TransactionDate) = @Year
    WHERE c.IsActive = 1
    GROUP BY c.Id, c.Name, c.Color, c.Icon
);

GO

-- Função para obter receitas do mês
CREATE FUNCTION fn_GetMonthlyIncome(@Month INT, @Year INT)
RETURNS DECIMAL(18,2)
AS
BEGIN
    DECLARE @Income DECIMAL(18,2);

    SELECT @Income = SUM(Amount)
    FROM Transactions
    WHERE TransactionType = 1
        AND MONTH(TransactionDate) = @Month
        AND YEAR(TransactionDate) = @Year;

    RETURN ISNULL(@Income, 0);
END;

GO

-- ====================================
-- STORED PROCEDURES ADICIONAIS
-- ====================================

-- Procedure para backup de dados
CREATE PROCEDURE sp_BackupTransactions
    @BackupDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @BackupDate IS NULL SET @BackupDate = GETDATE();

    -- Criar tabela de backup se não existir
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='TransactionsBackup' AND xtype='U')
    BEGIN
        SELECT * INTO TransactionsBackup FROM Transactions WHERE 1=0;
    END;

    -- Fazer backup das transações
    INSERT INTO TransactionsBackup
    SELECT * FROM Transactions
    WHERE CAST(CreatedAt AS DATE) = @BackupDate;

    SELECT COUNT(*) as BackupRecords FROM TransactionsBackup
    WHERE CAST(CreatedAt AS DATE) = @BackupDate;
END;

GO

-- Procedure para relatório mensal
CREATE PROCEDURE sp_MonthlyReport
    @Month INT,
    @Year INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Resumo geral do mês
    SELECT
        'RESUMO MENSAL' as ReportType,
        @Month as Month,
        @Year as Year,
        SUM(CASE WHEN TransactionType = 1 THEN Amount ELSE 0 END) as TotalIncome,
        SUM(CASE WHEN TransactionType = 0 THEN Amount ELSE 0 END) as TotalExpenses,
        SUM(CASE WHEN TransactionType = 1 THEN Amount ELSE -Amount END) as NetBalance,
        COUNT(*) as TotalTransactions
    FROM Transactions
    WHERE MONTH(TransactionDate) = @Month AND YEAR(TransactionDate) = @Year;

    -- Gastos por categoria
    SELECT
        'GASTOS POR CATEGORIA' as ReportType,
        c.Name as CategoryName,
        SUM(t.Amount) as TotalAmount,
        COUNT(t.Id) as TransactionCount,
        CAST(SUM(t.Amount) * 100.0 / (
            SELECT SUM(Amount) FROM Transactions
            WHERE TransactionType = 0
                AND MONTH(TransactionDate) = @Month
                AND YEAR(TransactionDate) = @Year
        ) AS DECIMAL(5,2)) as Percentage
    FROM Categories c
    INNER JOIN Transactions t ON c.Id = t.CategoryId
    WHERE t.TransactionType = 0
        AND MONTH(t.TransactionDate) = @Month
        AND YEAR(t.TransactionDate) = @Year
        AND c.IsActive = 1
    GROUP BY c.Name
    ORDER BY TotalAmount DESC;

    -- Top 10 maiores gastos
    SELECT TOP 10
        'MAIORES GASTOS' as ReportType,
        t.Description,
        t.Amount,
        t.TransactionDate,
        c.Name as CategoryName
    FROM Transactions t
    INNER JOIN Categories c ON t.CategoryId = c.Id
    WHERE t.TransactionType = 0
        AND MONTH(t.TransactionDate) = @Month
        AND YEAR(t.TransactionDate) = @Year
    ORDER BY t.Amount DESC;
END;

GO

-- ====================================
-- DADOS DE TESTE ADICIONAIS
-- ====================================

-- Inserir mais transações para teste
INSERT INTO Transactions (Description, Amount, TransactionDate, TransactionType, CategoryId, Notes) VALUES
('Aluguel Outubro', 1200.00, '2025-10-01', 0, 3, 'Aluguel mensal'),
('Freelance Mobile App', 2500.00, '2025-10-02', 1, 8, 'Desenvolvimento de app mobile'),
('Posto de Gasolina', 180.00, '2025-10-03', 0, 2, 'Abastecimento mensal'),
('Academia', 89.90, '2025-10-05', 0, 4, 'Mensalidade da academia'),
('Dividendos FII', 320.00, '2025-10-06', 1, 9, 'Dividendos de fundos imobiliários'),
('Pizza Delivery', 65.00, '2025-10-07', 0, 1, 'Jantar em casa'),
('Livros Técnicos', 150.00, '2025-10-08', 0, 5, 'Livros de programação'),
('Presente Aniversário', 200.00, '2025-10-10', 0, 10, 'Presente para familiar');

-- Verificar dados inseridos
SELECT 'Categorias ativas:' as Info, COUNT(*) as Count FROM Categories WHERE IsActive = 1
UNION ALL
SELECT 'Total de transações:', COUNT(*) FROM Transactions
UNION ALL
SELECT 'Receitas:', COUNT(*) FROM Transactions WHERE TransactionType = 1
UNION ALL
SELECT 'Despesas:', COUNT(*) FROM Transactions WHERE TransactionType = 0;

GO

PRINT 'Triggers, functions and additional procedures created successfully!';
PRINT 'Current balance: R$ ' + CAST(dbo.fn_GetCurrentBalance() AS VARCHAR(20));
