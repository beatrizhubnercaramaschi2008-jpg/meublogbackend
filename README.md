# Backend - Meu Blog

API REST desenvolvida com Node.js, Express e MongoDB para suportar a plataforma de compartilhamento de histórias.

## 🚀 Como Iniciar

### Instalação

```bash
npm install
```

### Configuração

Crie um arquivo `.env` com as seguintes variáveis:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/meu_blog
JWT_SECRET=sua_chave_secreta_super_segura_aqui
NODE_ENV=development
```

### Execução

**Desenvolvimento (com nodemon):**
```bash
npm run dev
```

**Produção:**
```bash
npm start
```

## 📚 Documentação da API

Acesse `http://localhost:5000/api/health` para verificar se o servidor está rodando.

## 🔒 Autenticação

A maioria dos endpoints requer um token JWT no header:

```
Authorization: Bearer {token}
```

## 📦 Dependências Principais

- `express` - Framework web
- `mongoose` - ODM para MongoDB
- `jsonwebtoken` - Autenticação JWT
- `bcryptjs` - Hash de senhas
- `cors` - CORS middleware
- `dotenv` - Variáveis de ambiente

## 📝 Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| PORT | Porta do servidor (padrão: 5000) |
| MONGODB_URI | String de conexão MongoDB |
| JWT_SECRET | Chave secreta para JWT |
| NODE_ENV | Ambiente (development/production) |

---

Para mais informações, consulte o README principal do projeto.
