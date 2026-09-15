# EnderecoCerto

Cadastro de usuários e seus endereços, com preenchimento automático via [ViaCEP](https://viacep.com.br/). Usuários comuns só enxergam os próprios dados; administradores enxergam todo mundo — a garantia dessa regra é sempre no backend, nunca só escondendo botão no front.

## O que o projeto faz

- Cadastro de usuário com CPF (validado pelo dígito verificador, não só formato) e senha.
- Login com CPF + senha, sessão via JWT.
- CRUD de endereços por usuário, com a regra de que só pode existir **um** endereço principal por vez — marcar um novo principal desmarca o anterior, e excluir o principal promove automaticamente o mais antigo.
- Busca de endereço por CEP (ViaCEP), com cache em memória para não repetir a mesma consulta.
- Listagem de todos os usuários, restrita a administradores.

## Stack

| Camada | Tecnologia | Por quê |
|---|---|---|
| Backend | Java 21 + Spring Boot 3.3.4 (Maven) | Ecossistema maduro, fácil achar referência se travar em algo |
| Banco | PostgreSQL (Flyway) em dev/produção; H2 para testes | Migrations versionadas em vez de deixar o Hibernate gerar schema; H2 evita depender de infra pra rodar teste |
| Frontend | Next.js 16 + React 19 + TailwindCSS + shadcn/ui, Axios | Scaffold já vinha do v0.app; Axios com interceptor centraliza o envio do JWT |
| Autenticação | JWT guardado em memória no front (não em localStorage) | Evita que um XSS simples vaze o token |

Monorepo com `backend/` e `frontend/` — clona uma coisa só pra avaliar o projeto inteiro.

## Como rodar localmente

### Com Docker (mais simples)

Precisa só de Docker e Docker Compose instalados.

```bash
docker compose up --build
```

Sobe os três serviços:
- Postgres em `localhost:5432`
- Backend em `localhost:8080` (aplica as migrations sozinho ao subir)
- Frontend em `localhost:3000`

Pra derrubar: `docker compose down` (adicione `-v` pra também apagar os dados do Postgres).

### Sem Docker

Precisa de JDK 21, Maven, um Postgres rodando localmente, Node 20+ e pnpm (`corepack enable` já ativa).

**Backend** (`backend/`):
```bash
mvn spring-boot:run
```
Por padrão espera um Postgres em `localhost:5432` com banco `enderecocerto`, usuário/senha `postgres`/`postgres` (dá pra sobrescrever, ver variáveis abaixo). As migrations do Flyway rodam automaticamente no start.

**Frontend** (`frontend/`):
```bash
pnpm install
pnpm dev
```
Abre em `localhost:3000`. Sem configuração extra, ele já aponta pro backend em `localhost:8080`.

## Variáveis de ambiente

### Backend

| Variável | Padrão | Descrição |
|---|---|---|
| `DB_HOST` | `localhost` | Host do Postgres |
| `DB_PORT` | `5432` | Porta do Postgres |
| `DB_NAME` | `enderecocerto` | Nome do banco |
| `DB_USER` | `postgres` | Usuário do banco |
| `DB_PASSWORD` | `postgres` | Senha do banco |
| `JWT_SECRET` | um valor de dev | **Trocar em produção.** Chave usada pra assinar o JWT |
| `JWT_EXPIRATION_MINUTES` | `60` | Validade do token |
| `VIACEP_BASE_URL` | `https://viacep.com.br/ws` | Base da API do ViaCEP |
| `VIACEP_CACHE_TTL_MINUTES` | `60` | TTL do cache de CEP em memória |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Origens liberadas pro navegador chamar a API |
| `PORT` | `8080` | Porta HTTP do backend |

### Frontend

| Variável | Padrão | Descrição |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | URL base do backend (fica embutida no build, então em Docker é passada como build arg) |

Veja `frontend/.env.example`.

## Como rodar os testes

```bash
cd backend
mvn test
```

23 testes: validação de CPF (dígitos verificadores, sequências repetidas), a regra de troca do endereço principal e a promoção automática após exclusão, e autorização ponta a ponta (usuário comum recebe 403 ao tentar acessar recurso de outro usuário ou a listagem de admin). Rodam contra H2 em memória, sem precisar de Postgres.

```bash
cd frontend
pnpm test
```

15 testes com Vitest, cobrindo a validação de CPF no cliente (`features/usuarios/validar-cpf.ts`) com os mesmos casos do `ValidadorCpfTest` do backend — os dois lados usam o mesmo algoritmo de dígito verificador, implementado separadamente de propósito. O resto do frontend (telas, formulários) foi verificado manualmente, não tem suíte automatizada.

