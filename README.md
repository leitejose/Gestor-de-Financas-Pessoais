# 💰 Gestor de Finanças Pessoais

Um sistema moderno e intuitivo para gestão de finanças pessoais, desenvolvido com Angular 17 e Supabase PostgreSQL.

## 🌟 Características Principais

- **Dashboard Interativo**: Visualize seus gastos e receitas em tempo real
- **Gestão de Transações**: Adicione, edite e remova transações facilmente
- **Categorização Inteligente**: Organize suas finanças por categorias personalizáveis
- **Relatórios Visuais**: Gráficos e estatísticas para acompanhar sua evolução financeira
- **Interface Responsiva**: Acesse de qualquer dispositivo com design Material
- **Cloud Database**: Dados seguros e sincronizados na nuvem com Supabase

## 🚀 Tecnologias Utilizadas

- **Frontend**: Angular 17 (Standalone Components)
- **UI Framework**: Angular Material
- **Database**: Supabase PostgreSQL
- **Hospedagem**: Vercel
- **Linguagem**: TypeScript
- **Gerenciamento de Estado**: RxJS BehaviorSubjects

## 📱 Funcionalidades

### 💳 Gestão de Transações
- Cadastro de receitas e despesas
- Edição e exclusão de transações
- Filtros por categoria e período
- Busca por descrição

### 📊 Categorias
- Categorias para receitas e despesas
- Criação de categorias personalizadas
- Organização por tipo e cor

### 📈 Dashboard e Relatórios
- Resumo financeiro em tempo real
- Gráficos de distribuição por categoria
- Evolução mensal dos gastos
- Indicadores de saldo e performance

### 🎨 Interface
- Design Material moderno
- Tema escuro/claro
- Navegação intuitiva
- Experiência mobile-first

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

### Configuração Local

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/finance-manager.git
cd finance-manager
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
Crie um arquivo `.env` na raiz do projeto:
```env
NG_APP_SUPABASE_URL=sua_url_do_supabase
NG_APP_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. **Execute o banco de dados:**
- Acesse seu projeto no Supabase
- Execute o script `supabase-schema.sql` no SQL Editor

5. **Inicie o servidor de desenvolvimento:**
```bash
npm start
```

A aplicação estará disponível em `http://localhost:4200`

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

**Categories** - Categorias de transações
- `id` (UUID, PK)
- `name` (Varchar) - Nome da categoria
- `description` (Text) - Descrição
- `type` (Enum) - income/expense
- `color` (Varchar) - Cor da categoria
- `icon` (Varchar) - Ícone

**Transactions** - Transações financeiras
- `id` (UUID, PK)
- `description` (Varchar) - Descrição da transação
- `amount` (Decimal) - Valor (positivo para receitas, negativo para despesas)
- `date` (Date) - Data da transação
- `type` (Enum) - income/expense
- `category_id` (UUID, FK) - Referência à categoria

## 🚀 Deploy

### Vercel (Recomendado)

1. **Conecte seu repositório GitHub ao Vercel**
2. **Configure as variáveis de ambiente no dashboard da Vercel:**
   - `NG_APP_SUPABASE_URL`
   - `NG_APP_SUPABASE_ANON_KEY`
3. **Deploy automático a cada push**

### Build Manual
```bash
npm run build
```

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── components/          # Componentes da aplicação
│   │   ├── dashboard/       # Dashboard principal
│   │   ├── transactions/    # Gestão de transações
│   │   ├── categories/      # Gestão de categorias
│   │   └── shared/          # Componentes compartilhados
│   ├── services/            # Serviços da aplicação
│   │   ├── supabase.service.ts
│   │   ├── transaction.service.ts
│   │   └── category.service.ts
│   ├── models/              # Interfaces e tipos
│   └── guards/              # Guards de rota
├── assets/                  # Recursos estáticos
└── environments/            # Configurações de ambiente
```

## 🎯 Roadmap

- [ ] Autenticação de usuários
- [ ] Metas e objetivos financeiros
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Notificações e lembretes
- [ ] Integração com bancos (Open Banking)
- [ ] App mobile nativo
- [ ] Análise de gastos com IA

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

- **Desenvolvedor**: José
- **Email**: seu-email@example.com
- **LinkedIn**: [Seu perfil](https://linkedin.com/in/seu-perfil)

---

⭐ **Se este projeto te ajudou, não esqueça de dar uma estrela!**
