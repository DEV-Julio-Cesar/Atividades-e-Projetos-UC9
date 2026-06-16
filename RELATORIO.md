# Relatório Técnico — Padaria Pão Saboroso

---

## 1. Visão Geral do Sistema

Sistema web de gestão para a **Padaria Pão Saboroso**, desenvolvido com Node.js seguindo o padrão arquitetural **MVC (Model-View-Controller)**. Permite gerenciar clientes, pratos, pedidos e itens de pedido por meio de um painel web com autenticação JWT.

---

## 2. Modelo Arquitetural — MVC

O sistema segue o padrão **MVC (Model – View – Controller)**:

| Camada | Responsabilidade |
|---|---|
| **Model** | Define a estrutura dos dados e se comunica com o banco via Sequelize ORM |
| **View** | Renderiza as páginas HTML usando o template engine EJS |
| **Controller** | Recebe as requisições, aplica a lógica de negócio e retorna a resposta |

---

## 3. Ferramentas e Tecnologias Utilizadas

### Runtime e Linguagem
| Ferramenta | Versão | Motivo do Uso |
|---|---|---|
| **Node.js** | v26.1.0 | Ambiente de execução JavaScript no servidor |
| **JavaScript (ESModules)** | ES2022+ | Linguagem principal; uso de `import/export` nativo |

### Framework Web
| Ferramenta | Versão | Motivo do Uso |
|---|---|---|
| **Express** | ^5.2.1 | Framework HTTP para criar rotas, middlewares e servir páginas |

### Banco de Dados
| Ferramenta | Versão | Motivo do Uso |
|---|---|---|
| **SQLite3** | 5.1.7 | Banco de dados local usado em ambiente de **desenvolvimento** (sem precisar de servidor) |
| **PostgreSQL (pg)** | ^8.21.0 | Banco de dados relacional usado em **produção** (hospedado no Render) |
| **pg-hstore** | ^2.3.4 | Serializa e desserializa dados JSON para o PostgreSQL |
| **Sequelize ORM** | ^6.37.3 | Abstração do banco de dados; permite usar SQLite em dev e PostgreSQL em produção com o mesmo código |

### Autenticação e Segurança
| Ferramenta | Versão | Motivo do Uso |
|---|---|---|
| **jsonwebtoken (JWT)** | ^9.0.3 | Geração e verificação de tokens de autenticação sem necessidade de sessão no servidor |
| **bcrypt** | ^6.0.0 | Criptografia de senhas dos usuários antes de salvar no banco |
| **dotenv** | ^16.4.5 | Carrega variáveis de ambiente do arquivo `.env` (senhas, chaves, URLs) |

### Template Engine
| Ferramenta | Versão | Motivo do Uso |
|---|---|---|
| **EJS** | ^5.0.2 | Renderiza páginas HTML dinâmicas no servidor, inserindo dados vindos dos controllers |

### Sessão e Cookies (parcialmente desativado)
| Ferramenta | Versão | Motivo do Uso |
|---|---|---|
| **cookie-parser** | ^1.4.7 | Leitura de cookies HTTP nas requisições |
| **express-session** | ^1.19.0 | Gerenciamento de sessão (foi substituído por JWT, mas a dependência ainda está presente) |
| **connect-sqlite3** | ^0.9.16 | Adaptador de sessão para SQLite (legado — não mais em uso ativo) |
| **connect-pg-simple** | ^10.0.0 | Adaptador de sessão para PostgreSQL (legado — não mais em uso ativo) |

### Utilitários
| Ferramenta | Versão | Motivo do Uso |
|---|---|---|
| **uuid** | ^14.0.0 | Geração de IDs únicos (UUIDs) para registros do banco de dados |
| **morgan** | ^1.10.1 | Logger HTTP — exibe no terminal cada requisição recebida pelo servidor |
| **cors** | ^2.8.6 | Habilita requisições de origens diferentes (Cross-Origin Resource Sharing) |

### Ferramentas de Desenvolvimento
| Ferramenta | Versão | Motivo do Uso |
|---|---|---|
| **nodemon** | ^3.1.14 | Reinicia o servidor automaticamente ao salvar alterações nos arquivos |
| **cross-env** | ^10.1.0 | Define variáveis de ambiente (`MODE_NODE=dev`) de forma compatível com Windows e Linux |

---

## 4. Estrutura de Pastas — O que cada uma faz e por quê

```
Atividades-e-Projetos-UC9/
│
├── index.js                  ← Ponto de entrada da aplicação
├── package.json              ← Configuração do projeto e dependências
├── .env                      ← Variáveis de ambiente (senhas, URLs, segredos)
├── .env.example              ← Modelo do .env para outros desenvolvedores
│
├── public/                   ← Arquivos estáticos servidos diretamente ao navegador
│   ├── css/                  ← Estilos globais da aplicação (app.css)
│   ├── html/                 ← Páginas HTML puras (login, cadastro, recuperar/nova senha)
│   └── img/                  ← Imagens estáticas do sistema
│
└── src/                      ← Código-fonte principal da aplicação
    ├── config/               ← Configurações globais do sistema
    ├── controllers/          ← Lógica de negócio e manipulação das requisições
    ├── database/             ← Arquivos de banco de dados e schema SQL
    ├── middlewares/          ← Funções intermediárias que rodam entre a rota e o controller
    ├── models/               ← Definição das tabelas/entidades do banco de dados
    ├── routes/               ← Mapeamento de URLs para controllers
    └── views/                ← Templates EJS renderizados como páginas HTML
```

---

### 4.1 Detalhamento de Cada Pasta

#### `index.js` — Ponto de Entrada
Arquivo raiz que inicializa tudo: carrega o `.env`, sincroniza o banco de dados e coloca o servidor Express para ouvir requisições na porta configurada. É o primeiro arquivo executado com `node index.js`.

---

#### `public/` — Arquivos Estáticos
Tudo que o Express serve diretamente ao navegador sem passar por controller.

- **`css/`** — Contém o `app.css` com todos os estilos visuais do sistema (layout, cores, formulários, tabelas).
- **`html/`** — Páginas HTML que não precisam de dados dinâmicos do servidor: tela de login, cadastro de usuário, recuperação e redefinição de senha.
- **`img/`** — Imagens e ícones usados nas páginas.

> **Por quê separar aqui?** Esses arquivos são entregues diretamente ao navegador pelo middleware `express.static`, sem consumir processamento do servidor.

---

#### `src/config/` — Configurações do Sistema
Centraliza as configurações que afetam toda a aplicação.

- **`app.js`** — Cria e configura a instância do Express: registra middlewares (morgan, json, static, EJS), conecta ao banco e monta as rotas.
- **`orm.js`** — Configura o Sequelize: usa SQLite em dev e PostgreSQL em produção com base na variável `MODE_NODE`. Também cria o usuário master automaticamente na primeira execução.

> **Por quê separar aqui?** Isolar configurações evita repetição e facilita trocar banco ou framework sem mexer no código de negócio.

---

#### `src/controllers/` — Lógica de Negócio
Cada controller é responsável por um domínio do sistema. Recebe a requisição, processa os dados e retorna a resposta (JSON ou renderiza uma view EJS).

| Arquivo | Responsabilidade |
|---|---|
| `pages.controller.js` | Renderiza todas as páginas do painel (dashboard, clientes, pratos, pedidos, itens) |
| `cliente.controller.js` | CRUD de clientes via API JSON |
| `prato.controller.js` | CRUD de pratos via API JSON |
| `pedido.controller.js` | CRUD de pedidos via API JSON |
| `itemPedido.controller.js` | CRUD de itens de pedido via API JSON |
| `login.controller.js` | Login, logout, recuperação e redefinição de senha |
| `controlUser.js` | Cadastro e gerenciamento de usuários do sistema |
| `home.controller.js` | Rota `/status` para verificar saúde da API |
| `controller.helpers.js` | Funções utilitárias compartilhadas entre controllers (ex: `criarId`, `criarErroHttp`) |

> **Por quê separar aqui?** Cada controller cuida de um domínio. Se a regra de negócio de clientes mudar, só o `cliente.controller.js` é alterado.

---

#### `src/database/` — Banco de Dados
Armazena os arquivos físicos do banco e o schema SQL.

- **`db.sqlite`** — Arquivo do banco SQLite usado em desenvolvimento local.
- **`restaurante.sqlite`** — Arquivo SQLite alternativo/legado.
- **`schema.sql`** — Script SQL com a definição das tabelas (documentação e referência).

> **Por quê separar aqui?** Mantém os arquivos de dados isolados do código, facilitando backup, reset e migração.

---

#### `src/middlewares/` — Middlewares
Funções que interceptam as requisições antes de chegarem ao controller.

- **`authUser.js`** — Contém três middlewares:
  - `autenticar` — Lê o token JWT do cookie, valida e popula `req.user`.
  - `validarPerfil` — Verifica se o usuário tem o perfil necessário para acessar a rota.
  - `apagarCache` — Adiciona headers HTTP para impedir que o navegador cache páginas protegidas.

> **Por quê separar aqui?** Middlewares são reutilizados em várias rotas. Centralizá-los evita duplicação de código.

---

#### `src/models/` — Modelos de Dados (Sequelize)
Define as tabelas do banco de dados como classes JavaScript usando Sequelize.

| Arquivo | Responsabilidade |
|---|---|
| `cliente.model.js` | Tabela de clientes |
| `prato.model.js` | Tabela de pratos/produtos |
| `pedido.model.js` | Tabela de pedidos |
| `itemPedido.model.js` | Tabela de itens de pedido (relação pedido ↔ prato) |
| `modelUSER.js` | Tabela de usuários do sistema |
| `associations.js` | Define os relacionamentos entre modelos (ex: Pedido `hasMany` ItemPedido) |
| `index.js` | Exporta todos os modelos em um único ponto de importação |
| `*.clean.model.js` | Versões simplificadas dos modelos (sem validações extras, para uso específico) |

> **Por quê separar aqui?** Cada model representa uma entidade do banco. Separar garante que a estrutura do banco esteja documentada em código e seja fácil de manter.

---

#### `src/routes/` — Rotas HTTP
Mapeia as URLs da aplicação para os controllers corretos.

| Arquivo | Rotas que gerencia |
|---|---|
| `index.js` | Rota raiz `/`, `/status`, agrega todas as outras rotas |
| `login.routes.js` | `/login` — autenticação |
| `user.routes.js` | `/User` — cadastro de usuários |
| `pages.routes.js` | `/painel` e sub-rotas do painel web |
| `clientes.routes.js` | `/clientes` — API REST de clientes |
| `pratos.routes.js` | `/pratos` — API REST de pratos |
| `pedidos.routes.js` | `/pedidos` — API REST de pedidos |
| `itensPedido.routes.js` | `/itens-pedido` — API REST de itens |

> **Por quê separar aqui?** Com um arquivo de rotas por domínio, é fácil adicionar, remover ou proteger rotas sem afetar o restante da aplicação.

---

#### `src/views/` — Templates EJS (páginas dinâmicas)
Arquivos `.ejs` que o Express renderiza no servidor, injetando dados dos controllers e retornando HTML completo ao navegador.

| Arquivo | Página que representa |
|---|---|
| `index.ejs` | Tela inicial / landing page |
| `dashboard.ejs` | Painel principal com resumo geral |
| `clientes.ejs` | Listagem e cadastro de clientes |
| `pratos.ejs` | Listagem e cadastro de pratos |
| `pedidos.ejs` | Listagem e cadastro de pedidos |
| `itens-pedido.ejs` | Listagem e cadastro de itens de pedido |

> **Por quê separar aqui?** Views são a camada de apresentação do MVC. Separar do controller permite alterar o visual sem tocar na lógica de negócio.

---

## 5. Fluxo Geral de uma Requisição

```
Navegador
   │
   ▼
index.js  (inicia o servidor)
   │
   ▼
src/config/app.js  (middlewares globais: morgan, json, static)
   │
   ▼
src/routes/index.js  (qual rota foi chamada?)
   │
   ├─ Rota pública → controller diretamente
   │
   └─ Rota protegida → middleware autenticar (JWT) → controller
                                                          │
                                                          ▼
                                               src/models/  (consulta o banco via Sequelize)
                                                          │
                                                          ▼
                                               src/views/  (renderiza EJS com os dados)
                                                          │
                                                          ▼
                                                    Navegador (HTML final)
```

---

## 6. Ambientes de Execução

| Ambiente | Banco | Como ativar |
|---|---|---|
| **Desenvolvimento** | SQLite (`db.sqlite`) | `npm run dev` → define `MODE_NODE=dev` |
| **Produção** | PostgreSQL (Render) | `npm start` → usa `DATABASE_URL` do `.env` |

---

*Relatório gerado em: Junho/2026*
