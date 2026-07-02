# G-Pass — Gerenciador de Senhas Corporativo

Sistema web para gerenciamento corporativo de senhas. Permite que administradores organizem, compartilhem e controlem o acesso a credenciais entre funcionários.

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Frontend** | React 19 + JSX |
| **Linguagem** | JavaScript (ESM) |
| **Estilização** | Tailwind CSS v4 |
| **ORM** | Prisma 6 |
| **Banco** | PostgreSQL (Neon serverless) |
| **Autenticação** | JWT + bcryptjs |
| **Ícones** | Lucide React |
| **Testes** | Vitest + Testing Library |
| **Deploy** | Vercel |

---

## Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento (Next.js)
npm run build        # Build de produção (Next.js)
npm run start        # Inicia servidor de produção
npm run lint         # Executa ESLint

npm run db:generate  # Gera Prisma Client a partir do schema
npm run db:push      # Sincroniza schema com o banco
npm run db:seed      # Popula banco com dados iniciais

npm run test         # Executa testes (Vitest)
npm run test:watch   # Executa testes em modo watch
```

---

## Estrutura do Projeto

### Raiz — Configurações e entry points

```
├── .env                     # Variáveis de ambiente (DATABASE_URL, JWT_SECRET)
├── .env.example             # Template das variáveis de ambiente
├── .gitignore
├── package.json             # Manifesto do projeto (dependências e scripts)
├── next.config.mjs          # Config do Next.js (desabilita otimização de imagens)
├── vite.config.js           # Config do Vite (usado para testes com Vitest)
├── postcss.config.mjs       # Plugin PostCSS do Tailwind
├── eslint.config.js         # Config do ESLint (React Hooks + React Refresh)
├── jsconfig.json            # Path alias: @ → ./src
├── index.html               # Entry point HTML para Vite (não usado em produção)
```

---

### `app/` — Next.js App Router (Páginas + API)

Ponto de entrada da aplicação Next.js. Contém o layout raiz, a página inicial e todas as rotas de API.

```
app/
├── globals.css               # Estilos globais + tema Tailwind (claro/escuro)
├── layout.js                 # Layout raiz: HTML lang, favicon, fonte Inter
├── page.js                   # Página inicial — renderiza <AppShell />
└── api/                      # Rotas de API (REST)
    ├── auth/
    │   └── login/route.js    # POST /api/auth/login — autenticação (email + frase secreta)
    ├── users/
    │   ├── route.js          # GET /api/users — listar; POST — criar; PUT — reordenar
    │   └── [id]/
    │       ├── route.js      # PUT /api/users/[id] — atualizar; DELETE — excluir
    │       └── access/route.js # GET/PUT /api/users/[id]/access — compartilhamentos
    ├── passwords/
    │   ├── route.js          # GET /api/passwords — listar; POST — criar; PUT — reordenar
    │   └── [id]/route.js     # PUT /api/passwords/[id] — atualizar; DELETE — excluir
    ├── folders/
    │   ├── route.js          # GET /api/folders — listar; POST — criar; PUT — reordenar
    │   └── [id]/route.js     # PUT /api/folders/[id] — atualizar; DELETE — excluir
    ├── tags/
    │   ├── route.js          # GET /api/tags — listar; POST — criar; PUT — reordenar
    │   └── [id]/route.js     # PUT /api/tags/[id] — atualizar; DELETE — excluir
    └── audit/route.js        # GET /api/audit — histórico de auditoria
```

**Middleware de autenticação:** Todas as rotas de API usam `verifyAuth()` de `src/lib/auth.js` para validar o token JWT. Rotas de admin verificam `role === 'admin'`.

---

### `prisma/` — Banco de Dados

```
prisma/
├── schema.prisma             # Schema do banco PostgreSQL (6 models)
└── seed.js                   # Popula admin inicial: caique@germano.com / senha123
```

**Modelos do banco:**

| Modelo | Descrição |
|--------|-----------|
| `User` | Funcionários e admins (role: admin/user, status: active/inactive) |
| `Folder` | Pastas com suporte a subpastas (parentId) e ordenação |
| `Password` | Credenciais (nome, usuário, senha, URL, notas, favorito) |
| `Tag` | Etiquetas coloridas para categorização |
| `PasswordTag` | Relação N:N entre senhas e tags |
| `SharedAccess` | Controle de compartilhamento (permission: read/write) |

---

### `public/` — Arquivos Estáticos

```
public/
└── favicon.svg               # Ícone da aba do navegador
```

---

### `src/` — Aplicação React

#### Entry Points

```
src/
├── main.jsx                  # Entry point React (renderiza <App /> no #root)
├── App.jsx                   # Componente raiz: gerenciamento de estado (login/onboarding/dashboard)
└── index.css                 # Definições de tema Tailwind (claro/escuro)
```

**Fluxo de navegação:**
1. `App.jsx` gerencia 3 estados: `login` → `onboarding` → `dashboard`
2. `LoginScreen` autentica o usuário
3. `OnboardingScreen` é um tutorial para primeiro acesso
4. `DashboardScreen` é a tela principal com sidebar + conteúdo

> **Nota:** `App.jsx` + `main.jsx` foram o entry point original (Vite SPA). Hoje o Next.js usa `app/page.js` → `AppShell.jsx` como entry. Ambos os fluxos coexistem — o Vite pode ser usado para testes.

---

#### `src/components/` — Componentes Reutilizáveis

```
components/
├── AppShell.jsx              # Entry da aplicação (Next.js): restaura sessão, gerencia fluxo
├── Avatar.jsx                # Avatar circular com iniciais + cor derivada do nome
├── Badge.jsx                 # Etiqueta colorida (status, tags, variantes)
├── Button.jsx                # Botão reutilizável (primary/secondary/ghost/danger/outline)
├── EmptyState.jsx            # Placeholder para listas vazias (ícone + mensagem + ação)
├── Input.jsx                 # Input de formulário com label, erro, hint e ícone
├── Modal.jsx                 # Modal com backdrop, tecla Escape, tamanhos configuráveis
├── Sidebar.jsx               # Navegação principal com pastas, tags, funcionários
├── Table.jsx                 # Tabela genérica com ordenação, seleção e drag-and-drop
└── ThemeToggle.jsx           # Botão de alternar tema claro/escuro
```

**Onde cada componente é usado:**

| Componente | Usado em |
|-----------|----------|
| AppShell | `app/page.js` |
| Avatar | SettingsScreen, Sidebar, ShareModal, PasswordFormModal |
| Badge | DashboardScreen, EmployeeScreen, TagScreen, ShareModal, PasswordFormModal, Sidebar |
| Button | LoginScreen, OnboardingScreen, DashboardScreen, SettingsScreen, FolderScreen, EmployeeScreen, TagScreen, ShareModal, PasswordFormModal |
| EmptyState | DashboardScreen, FolderScreen, EmployeeScreen, TagScreen, AuditScreen |
| Input | LoginScreen, SettingsScreen, FolderScreen, EmployeeScreen, TagScreen, ShareModal, PasswordFormModal |
| Modal | FolderScreen, EmployeeScreen, TagScreen, ShareModal, PasswordFormModal |
| Sidebar | DashboardScreen |
| Table | DashboardScreen |
| ThemeToggle | LoginScreen, OnboardingScreen, DashboardScreen |

---

#### `src/screens/` — Telas Completas

```
screens/
├── LoginScreen.jsx           # Login em 2 etapas: email → frase secreta
├── OnboardingScreen.jsx      # Tutorial de 3 passos para novos usuários
├── DashboardScreen.jsx       # Tela principal: sidebar + tabela + painel de detalhes
├── PasswordFormModal.jsx     # Formulário de criação/edição de senha
├── ShareModal.jsx            # Modal de compartilhamento com funcionários
├── SettingsScreen.jsx        # Configurações (perfil, importação em lote, auditoria)
├── EmployeeScreen.jsx        # CRUD de funcionários (admin)
├── FolderScreen.jsx          # CRUD de pastas com árvore e drag-and-drop
├── TagScreen.jsx             # CRUD de tags com seletor de cor
└── AuditScreen.jsx           # Histórico de auditoria (admin)
```

**Fluxo entre telas:**
```
LoginScreen → DashboardScreen
                ├── PasswordFormModal (criar/editar senha)
                ├── ShareModal (compartilhar senha)
                ├── SettingsScreen
                │     └── AuditScreen
                ├── EmployeeScreen
                ├── FolderScreen
                └── TagScreen
```

---

#### `src/context/` — Estado Global (React Context)

```
context/
├── StoreContext.jsx          # Estado central: senhas, pastas, tags, usuários + CRUD
└── ThemeContext.jsx          # Tema claro/escuro com persistência em localStorage
```

**StoreContext** é o coração dos dados da aplicação. Mantém:
- Arrays de `passwords`, `folders`, `tags`, `users`
- Objeto `api` com métodos `get/post/put/delete` (injeta JWT automaticamente)
- Funções CRUD para cada entidade
- Helpers de consulta: `getPasswordById`, `getPasswordsByFolder`, `getPasswordsByTag`, etc.
- `loadData()` que busca todos os dados conforme a role do usuário

---

#### `src/lib/` — Utilitários Compartilhados

```
lib/
├── auth.js                   # verifyAuth(request) → valida JWT; unauthorized() → 401
└── prisma.js                 # Singleton do PrismaClient (evita múltiplas conexões)
```

**auth.js** é usado por todas as rotas de API para proteger endpoints.
**prisma.js** garante que apenas uma instância do Prisma seja criada, evitando vazamento de conexão em hot-reload.

---

#### `src/test/` — Configuração de Testes

```
test/
└── setup.js                  # Setup do Vitest: mock de localStorage, matchMedia, clipboard
```

---

## Modelo de Dados (Simplificado)

```
User (1) ────< SharedAccess >──── (1) Password
User (1) ────< Password          (criada por)
Folder (1) ──< Password          (opcional)
Password >───< PasswordTag >─── Tag
Folder ────< Folder (subpastas, auto-relacionamento)
```

---

## Autenticação e Autorização

1. O usuário faz login com email + frase secreta → recebe um JWT (7 dias)
2. O token é armazenado no `localStorage` e enviado via header `Authorization: Bearer <token>`
3. Cada requisição de API valida o token com `verifyAuth()`
4. Ações administrativas verificam `role === 'admin'`
5. Funcionários (`role: user`) só veem senhas compartilhadas com eles

---

## Tema Claro/Escuro

Gerenciado pelo `ThemeContext`. O tema é:
- Definido como `dark` por padrão
- Persistido no `localStorage` (chave `gpass-theme`)
- Alternado via classe `.dark` no elemento `<html>`
- Estilizado com variáveis CSS customizadas em `app/globals.css`

---

## Deploy

O projeto está configurado para deploy na Vercel. Comandos:

```bash
vercel                          # Deploy de preview
vercel --prod                   # Deploy de produção
```

Variáveis de ambiente necessárias na Vercel:
- `DATABASE_URL` — string de conexão PostgreSQL (Neon)
- `JWT_SECRET` — chave secreta para assinar tokens JWT
