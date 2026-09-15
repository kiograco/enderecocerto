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
| Frontend | Next.js 16 + React 19 + TailwindCSS + shadcn/ui, Axios, TanStack Query | Scaffold já vinha do v0.app; Axios com interceptor centraliza o envio do JWT; React Query cuida de cache, invalidação e estado de loading/erro das chamadas à API |
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

## Como virar administrador

O cadastro público (`POST /usuarios`, tela `/cadastro`) sempre cria um usuário **COMUM** — de propósito, ninguém pode se autoconceder acesso de admin pela API (veja o comentário em `UsuarioService.criarUsuario`). Não existe seed de admin no Flyway também de propósito: hardcodar uma senha de admin numa migration que roda em produção, num repositório público, seria expor credencial de admin pra qualquer um que ler o código.

Pra promover o primeiro admin, mexa direto no banco depois de cadastrar o usuário normalmente pela tela:

**Com Docker Compose:**
```bash
docker compose exec postgres psql -U postgres -d enderecocerto -c "UPDATE usuarios SET tipo = 'ADMIN' WHERE cpf = '00000000000';"
```

**Postgres local (sem Docker):**
```bash
psql -U postgres -d enderecocerto -c "UPDATE usuarios SET tipo = 'ADMIN' WHERE cpf = '00000000000';"
```

**No Render:** abra o banco `enderecocerto-db` no dashboard → aba "Connect" → copie a `PSQL Command` e rode o mesmo `UPDATE` acima.

Troque `00000000000` pelo CPF (só dígitos) do usuário que você cadastrou. No próximo login, o token já sai com `tipo: ADMIN` e a tela `/usuarios` (listagem, admin-only) fica acessível.

## Deploy (Render)

`render.yaml` na raiz descreve os três serviços (Postgres + backend + frontend, cada um via seu Dockerfile) como um [Blueprint](https://render.com/docs/blueprint-spec) do Render:

1. No dashboard do Render: **New → Blueprint**, conecte o repositório do GitHub.
2. O Render lê o `render.yaml` e mostra os três recursos a criar (`enderecocerto-db`, `enderecocerto-backend`, `enderecocerto-frontend`). Confirme.
3. Ele provisiona o Postgres primeiro, depois builda e sobe os dois serviços web (o build do backend roda o Maven, o do frontend roda o `pnpm build` — leva alguns minutos).
4. As URLs seguem o padrão `https://<nome-do-servico>.onrender.com`. Se algum nome já estiver em uso por outra conta, o Render vai sugerir um nome diferente — nesse caso, atualize à mão as variáveis `CORS_ALLOWED_ORIGINS` (no serviço backend) e `NEXT_PUBLIC_API_URL` (no serviço frontend) pra apontar pra URL real, e dispare um **redeploy manual do frontend** (`NEXT_PUBLIC_API_URL` fica embutida no build, então só reiniciar não é suficiente).
5. `JWT_SECRET` é gerado automaticamente pelo Render (`generateValue: true`), nunca fica exposto no repositório.

Duas coisas a saber sobre o tier gratuito do Render (confira os detalhes atuais no dashboard, a política muda com o tempo): o web service "dorme" depois de um tempo sem tráfego, então a primeira requisição depois disso demora mais (~30-60s de cold start); e bancos Postgres gratuitos costumam ter validade limitada antes de precisar virar um plano pago.

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

24 testes: validação de CPF (dígitos verificadores, sequências repetidas), a promoção automática de principal após exclusão, e autorização ponta a ponta (usuário comum recebe 403 ao tentar acessar recurso de outro usuário ou a listagem de admin) rodam contra H2 em memória, sem precisar de Postgres. A troca de endereço principal (`EnderecoServicePrincipalIntegrationTest`) roda contra Postgres real via Testcontainers — precisa de Docker disponível — porque depende de uma constraint do banco (índice único parcial) que o H2 com schema gerado pelo Hibernate não reproduz.

```bash
cd frontend
pnpm test
```

22 testes com Vitest + Testing Library:
- Validação de CPF no cliente (`features/usuarios/validar-cpf.ts`), com os mesmos casos do `ValidadorCpfTest` do backend — os dois lados usam o mesmo algoritmo de dígito verificador, implementado separadamente de propósito.
- `FormularioEndereco`: autofill dos campos ao digitar um CEP válido, erro tratado quando o CEP não é encontrado, e que cria ou atualiza o endereço certo dependendo se já existe um `enderecoExistente`.
- `ListaEnderecosDoUsuario`: marcar outro endereço como principal, excluir só depois de confirmar no diálogo, e o estado vazio.

As demais telas (login, cadastro, listagem de usuários) foram verificadas manualmente, sem teste automatizado.

