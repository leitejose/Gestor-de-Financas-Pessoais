-- ====================================
-- GESTOR DE FINANÇAS - RESET DATABASE
-- ====================================
-- Este script remove e recria o banco de dados completamente

USE master;
GO

-- Forçar desconexão de usuários do banco (se necessário)
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'GestorFinancas')
BEGIN
    ALTER DATABASE GestorFinancas SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE GestorFinancas;
    PRINT 'Banco de dados GestorFinancas removido com sucesso!';
END
ELSE
BEGIN
    PRINT 'Banco de dados GestorFinancas não existe.';
END

GO

-- Recriar o banco de dados
CREATE DATABASE GestorFinancas;
GO

PRINT 'Banco de dados GestorFinancas criado. Execute agora o script 01_create_database.sql a partir da linha USE GestorFinancas;';