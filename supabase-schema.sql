-- Schema SQL para Supabase - Gestor de Finanças
-- Execute este script no SQL Editor do Supabase

-- 1. Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Criar ENUM para tipos de transação
CREATE TYPE transaction_type AS ENUM ('income', 'expense');

-- 3. Criar ENUM para tipos de categoria
CREATE TYPE category_type AS ENUM ('income', 'expense');

-- 4. Tabela de Categorias
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6366f1', -- Cor em hex
    icon VARCHAR(50) DEFAULT 'category',
    type category_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de Transações
CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    type transaction_type NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Índices para performance
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_categories_type ON categories(type);

-- 7. Triggers para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Inserir categorias padrão
INSERT INTO categories (name, description, color, icon, type) VALUES
-- Categorias de Receita
('Salário', 'Receita do trabalho principal', '#10b981', 'work', 'income'),
('Freelances', 'Trabalhos extras e projetos', '#3b82f6', 'code', 'income'),
('Investimentos', 'Rendimentos de investimentos', '#8b5cf6', 'trending-up', 'income'),

-- Categorias de Despesa
('Alimentação', 'Supermercado e refeições', '#ef4444', 'restaurant', 'expense'),
('Transporte', 'Combustível, transporte público', '#f59e0b', 'directions-car', 'expense'),
('Moradia', 'Aluguel, condomínio, IPTU', '#06b6d4', 'home', 'expense'),
('Saúde', 'Consultas, medicamentos, plano', '#ec4899', 'local-hospital', 'expense'),
('Educação', 'Cursos, livros, material', '#84cc16', 'school', 'expense'),
('Lazer', 'Cinema, restaurantes, viagens', '#f97316', 'beach-access', 'expense'),
('Outros', 'Despesas diversas', '#6b7280', 'more-horiz', 'expense');

-- 9. Inserir algumas transações de exemplo
INSERT INTO transactions (description, amount, type, category_id, date) VALUES
('Salário Outubro', 5000.00, 'income', (SELECT id FROM categories WHERE name = 'Salário'), '2024-10-01'),
('Supermercado Carrefour', -350.00, 'expense', (SELECT id FROM categories WHERE name = 'Alimentação'), '2024-10-02'),
('Combustível Posto Shell', -120.00, 'expense', (SELECT id FROM categories WHERE name = 'Transporte'), '2024-10-03'),
('Freelance Website', 800.00, 'income', (SELECT id FROM categories WHERE name = 'Freelances'), '2024-10-04'),
('Aluguel Apartamento', -1200.00, 'expense', (SELECT id FROM categories WHERE name = 'Moradia'), '2024-10-01'),
('Dividendos Ações', 150.00, 'income', (SELECT id FROM categories WHERE name = 'Investimentos'), '2024-10-01'),
('Restaurante Italiano', -85.00, 'expense', (SELECT id FROM categories WHERE name = 'Lazer'), '2024-10-02'),
('Consulta Médica', -200.00, 'expense', (SELECT id FROM categories WHERE name = 'Saúde'), '2024-10-03');

-- 10. Habilitar RLS (Row Level Security) - Opcional para multi-user
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 11. Policies para acesso público (desenvolvimento)
-- Para produção, você deve configurar políticas de segurança adequadas
-- CREATE POLICY "Allow all for categories" ON categories FOR ALL USING (true);
-- CREATE POLICY "Allow all for transactions" ON transactions FOR ALL USING (true);