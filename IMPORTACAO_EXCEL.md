# 📊 Importação de Transações via Excel

## Formato do Arquivo

O arquivo Excel deve conter as seguintes colunas na primeira linha (cabeçalho):

| Data | Descrição | Valor | Tipo | Categoria |
|------|-----------|-------|------|-----------|
| 2024-01-15 | Compras no supermercado | 150.50 | Despesa | Alimentação |
| 2024-01-16 | Salário mensal | 3000.00 | Receita | Salário |
| 2024-01-17 | Conta de luz | 120.00 | Despesa | Moradia |
| 2024-01-18 | Uber para o trabalho | 25.00 | Despesa | Transporte |
| 2024-01-19 | Freelance website | 500.00 | Receita | Freelances |

## Regras de Formatação

### Data
- Formato: AAAA-MM-DD (ex: 2024-01-15)
- Também aceita formatos do Excel (números seriais)

### Descrição
- Texto livre descrevendo a transação
- Mínimo 3 caracteres

### Valor
- Número decimal (ex: 150.50)
- Use ponto (.) como separador decimal
- Valores sempre positivos (o tipo define se é entrada ou saída)

### Tipo
Utilize exatamente um dos valores abaixo:
- **Para Receitas**: "Receita", "Entrada", "Income"
- **Para Despesas**: "Despesa", "Saída", "Expense"

### Categoria
O sistema possui as seguintes categorias pré-cadastradas:

#### 📈 Categorias de Receita:
- **Salário** - Receita do trabalho principal
- **Freelances** - Trabalhos extras e projetos
- **Investimentos** - Rendimentos de investimentos

#### 📉 Categorias de Despesa:
- **Alimentação** - Supermercado e refeições
- **Transporte** - Combustível, transporte público
- **Moradia** - Aluguel, condomínio, IPTU
- **Saúde** - Consultas, medicamentos, plano
- **Educação** - Cursos, livros, material
- **Lazer** - Cinema, restaurantes, viagens
- **Outros** - Despesas diversas

**📝 Importante**: Use exatamente o nome da categoria como listado acima. Se a categoria não for encontrada, o sistema usará uma categoria padrão do mesmo tipo.

## Como Usar

1. **Baixar Modelo**: Clique em "Baixar Modelo" para obter um arquivo de exemplo
2. **Preencher Dados**: Edite o arquivo com suas transações
3. **Importar**: Clique em "Importar Excel" e selecione o arquivo
4. **Verificar**: O sistema mostrará quantas transações foram importadas

## Dicas

- Remova as linhas de exemplo antes de importar seus dados
- Certifique-se de que as categorias já existem no sistema
- Verifique o formato das datas
- O sistema ignorará linhas vazias
- Erros de importação serão reportados ao final do processo

## ⚠️ Validações do Sistema

- **Data**: Deve ser uma data válida
- **Descrição**: Mínimo 3 caracteres
- **Valor**: Deve ser um número positivo maior que 0
- **Tipo**: Deve ser exatamente um dos valores listados
- **Categoria**: Deve corresponder a uma categoria existente

## 📋 Exemplo de Planilha Válida

```
Data        | Descrição                | Valor  | Tipo    | Categoria
2024-10-01  | Salário Outubro         | 5000   | Receita | Salário
2024-10-02  | Supermercado            | 350    | Despesa | Alimentação
2024-10-03  | Combustível             | 120    | Despesa | Transporte
2024-10-04  | Dividendos              | 150    | Receita | Investimentos
2024-10-05  | Almoço restaurante      | 45     | Despesa | Lazer
```