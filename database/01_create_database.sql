-- ====================================
-- GESTOR DE FINANÇAS - DATABASE SETUP
-- ====================================

-- Criar o banco de dados
CREATE DATABASE GestorFinancas;
GO

-- Usar o banco de dados
USE GestorFinancas;
GO

-- ====================================
-- TABELA DE CATEGORIAS
-- ====================================
CREATE TABLE Categories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    Color NVARCHAR(7), -- Para armazenar código hexadecimal da cor
    Icon NVARCHAR(50), -- Nome do ícone Material
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- ====================================
-- TABELA DE TRANSAÇÕES
-- ====================================
CREATE TABLE Transactions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Description NVARCHAR(500) NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    TransactionDate DATE NOT NULL,
    TransactionType TINYINT NOT NULL, -- 0 = Expense, 1 = Income
    CategoryId INT NOT NULL,
    Notes NVARCHAR(1000),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    -- Chave estrangeira
    CONSTRAINT FK_Transactions_Categories
        FOREIGN KEY (CategoryId) REFERENCES Categories(Id)
);

-- ====================================
-- ÍNDICES PARA PERFORMANCE
-- ====================================
CREATE INDEX IX_Transactions_TransactionDate ON Transactions(TransactionDate);
CREATE INDEX IX_Transactions_CategoryId ON Transactions(CategoryId);
CREATE INDEX IX_Transactions_TransactionType ON Transactions(TransactionType);
CREATE INDEX IX_Categories_IsActive ON Categories(IsActive);

-- ====================================
-- INSERIR CATEGORIAS PADRÃO
-- ====================================
INSERT INTO Categories (Name, Description, Color, Icon) VALUES
('Alimentação', 'Gastos com alimentação e supermercado', '#FF5722', 'restaurant'),
('Transporte', 'Gastos com transporte público, combustível, manutenção', '#2196F3', 'directions_car'),
('Moradia', 'Aluguel, contas de casa, manutenção', '#4CAF50', 'home'),
('Saúde', 'Gastos médicos, farmácia, plano de saúde', '#E91E63', 'local_hospital'),
('Educação', 'Cursos, livros, material escolar', '#9C27B0', 'school'),
('Entretenimento', 'Cinema, jogos, lazer', '#FF9800', 'movie'),
('Salário', 'Salário e benefícios do trabalho', '#4CAF50', 'work'),
('Freelance', 'Trabalhos freelance e projetos extras', '#00BCD4', 'computer'),
('Investimentos', 'Dividendos, rendimentos, vendas', '#795548', 'trending_up'),
('Outros', 'Outras categorias não especificadas', '#607D8B', 'category');

-- ====================================
-- INSERIR TRANSAÇÕES DE EXEMPLO
-- ====================================
INSERT INTO Transactions (Description, Amount, TransactionDate, TransactionType, CategoryId, Notes) VALUES
('Salário Setembro', 5000.00, '2025-09-01', 1, 7, 'Salário mensal'),
('Supermercado Extra', 350.00, '2025-09-15', 0, 1, 'Compras do mês'),
('Freelance Website', 1200.00, '2025-09-20', 1, 8, 'Desenvolvimento de site para cliente'),
('Uber', 45.00, '2025-09-22', 0, 2, 'Corrida para o trabalho'),
('Cinema', 30.00, '2025-09-25', 0, 6, 'Filme no shopping'),
('Conta de Luz', 120.00, '2025-09-26', 0, 3, 'Conta de energia elétrica'),
('Farmácia', 85.00, '2025-09-27', 0, 4, 'Medicamentos'),
('Dividendos Ações', 250.00, '2025-09-27', 1, 9, 'Dividendos de ações'),
('Restaurante', 95.00, '2025-09-28', 0, 1, 'Jantar em família'),
('Curso Online', 199.00, '2025-09-28', 0, 5, 'Curso de programação');

GO

-- ====================================
-- VIEWS ÚTEIS
-- ====================================

-- View para resumo financeiro
CREATE VIEW vw_FinancialSummary AS
SELECT
    YEAR(TransactionDate) as Year,
    MONTH(TransactionDate) as Month,
    SUM(CASE WHEN TransactionType = 1 THEN Amount ELSE 0 END) as TotalIncome,
    SUM(CASE WHEN TransactionType = 0 THEN Amount ELSE 0 END) as TotalExpenses,
    SUM(CASE WHEN TransactionType = 1 THEN Amount ELSE -Amount END) as Balance,
    COUNT(*) as TotalTransactions
FROM Transactions
GROUP BY YEAR(TransactionDate), MONTH(TransactionDate);

GO

-- View para transações com categoria
CREATE VIEW vw_TransactionsWithCategory AS
SELECT
    t.Id,
    t.Description,
    t.Amount,
    t.TransactionDate,
    t.TransactionType,
    t.Notes,
    t.CreatedAt,
    c.Name as CategoryName,
    c.Color as CategoryColor,
    c.Icon as CategoryIcon
FROM Transactions t
INNER JOIN Categories c ON t.CategoryId = c.Id
WHERE c.IsActive = 1;

GO

-- ====================================
-- STORED PROCEDURES
-- ====================================

-- Procedure para obter resumo financeiro por período
CREATE PROCEDURE sp_GetFinancialSummary
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @StartDate IS NULL SET @StartDate = DATEFROMPARTS(YEAR(GETDATE()), 1, 1);
    IF @EndDate IS NULL SET @EndDate = GETDATE();

    SELECT
        SUM(CASE WHEN TransactionType = 1 THEN Amount ELSE 0 END) as TotalIncome,
        SUM(CASE WHEN TransactionType = 0 THEN Amount ELSE 0 END) as TotalExpenses,
        SUM(CASE WHEN TransactionType = 1 THEN Amount ELSE -Amount END) as Balance,
        COUNT(*) as TotalTransactions,
        @StartDate as PeriodStart,
        @EndDate as PeriodEnd
    FROM Transactions
    WHERE TransactionDate BETWEEN @StartDate AND @EndDate;
END;

GO

-- Procedure para obter transações com filtros
CREATE PROCEDURE sp_GetTransactions
    @CategoryId INT = NULL,
    @TransactionType TINYINT = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @PageSize INT = 50,
    @PageNumber INT = 1
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;

    SELECT
        t.Id,
        t.Description,
        t.Amount,
        t.TransactionDate,
        t.TransactionType,
        t.Notes,
        t.CreatedAt,
        c.Name as CategoryName,
        c.Color as CategoryColor,
        c.Icon as CategoryIcon
    FROM Transactions t
    INNER JOIN Categories c ON t.CategoryId = c.Id
    WHERE
        (@CategoryId IS NULL OR t.CategoryId = @CategoryId)
        AND (@TransactionType IS NULL OR t.TransactionType = @TransactionType)
        AND (@StartDate IS NULL OR t.TransactionDate >= @StartDate)
        AND (@EndDate IS NULL OR t.TransactionDate <= @EndDate)
        AND c.IsActive = 1
    ORDER BY t.TransactionDate DESC, t.CreatedAt DESC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;

    -- Retornar também o total de registros
    SELECT COUNT(*) as TotalRecords
    FROM Transactions t
    INNER JOIN Categories c ON t.CategoryId = c.Id
    WHERE
        (@CategoryId IS NULL OR t.CategoryId = @CategoryId)
        AND (@TransactionType IS NULL OR t.TransactionType = @TransactionType)
        AND (@StartDate IS NULL OR t.TransactionDate >= @StartDate)
        AND (@EndDate IS NULL OR t.TransactionDate <= @EndDate)
        AND c.IsActive = 1;
END;

GO

-- Verificar dados inseridos
SELECT 'Categories' as TableName, COUNT(*) as RecordCount FROM Categories
UNION ALL
SELECT 'Transactions', COUNT(*) FROM Transactions;

PRINT 'Database setup completed successfully!';
PRINT 'Check the results above for record counts.';
