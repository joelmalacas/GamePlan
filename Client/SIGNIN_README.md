# GamePlan - Sistema de Registro (Sign In)

## 📋 Visão Geral

O sistema de registro do GamePlan foi completamente atualizado para integrar com a API backend, incluindo validações completas tanto no frontend quanto no backend, autenticação JWT e gerenciamento de sessões.

## 🚀 Funcionalidades Implementadas

### ✅ Validações Frontend
- **Validação de Nome**: Mínimo 2 caracteres, máximo 100 caracteres
- **Validação de Email**: Formato de email válido com normalização
- **Validação de Senha Robusta**:
  - Mínimo 8 caracteres
  - Pelo menos 1 letra maiúscula
  - Pelo menos 1 letra minúscula
  - Pelo menos 1 número
  - Pelo menos 1 caractere especial
- **Confirmação de Senha**: Verificação em tempo real
- **Validação de Idade**: Mínimo 13 anos
- **Validação de País**: Código de país válido
- **Validação de Telefone**: Opcional, mas validado se fornecido
- **Termos de Serviço**: Obrigatório aceitar

### 🔐 Integração com API
- **Endpoint**: `POST /api/v1/auth/register`
- **Autenticação JWT**: Token gerado automaticamente após registro
- **Gerenciamento de Sessão**: Criação automática de sessão
- **Tratamento de Erros**: Mensagens de erro específicas
- **Validação Backend**: Validação duplicada no servidor

### 🎨 Interface de Usuário
- **Feedback Visual**: Indicadores de validação em tempo real
- **Estados de Loading**: Botão com animação durante o registro
- **Alertas**: Mensagens de erro e sucesso elegantes
- **Animações**: Transições suaves nos elementos do formulário
- **Responsivo**: Funciona em todos os dispositivos

## 📁 Estrutura de Arquivos

```
GamePlan/Client/
├── signin.html          # Página de registro principal
├── test-signin.html     # Página de teste da API
├── JS/
│   ├── config.js        # Configurações da API
│   ├── api.js           # Cliente da API
│   └── signin.js        # Lógica do formulário de registro
└── CSS/
    └── signin.css       # Estilos do formulário
```

## 🛠️ Como Usar

### 1. Pré-requisitos
- Servidor backend rodando em `http://localhost:3000`
- Base de dados PostgreSQL configurada
- Scripts `config.js` e `api.js` carregados antes do `signin.js`

### 2. Configuração
O arquivo `config.js` contém todas as configurações necessárias:

```javascript
const API_CONFIG = {
  BASE_URL: "http://localhost:3000",
  API_PREFIX: "/api",
  API_VERSION: "v1",
  ENDPOINTS: {
    AUTH: {
      REGISTER: "/auth/register",
      // ... outros endpoints
    }
  }
};
```

### 3. Uso Básico
1. O usuário acessa `signin.html`
2. Preenche o formulário com dados válidos
3. O sistema valida em tempo real
4. Ao submeter, os dados são enviados para a API
5. Se bem-sucedido, o usuário é redirecionado para `login.html`

### 4. Teste da Integração
Use `test-signin.html` para testar a integração com a API:
1. Abra `test-signin.html` no navegador
2. Verifique se a API está carregada (mensagem verde)
3. Preencha o formulário (dados de teste já preenchidos)
4. Clique em "Test Registration"
5. Verifique o resultado no console e nas mensagens

## 🔧 Validações Implementadas

### Frontend (signin.js)
```javascript
// Validação de email
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validação de senha
const passwordRequirements = {
  length: (password) => password.length >= 8,
  uppercase: (password) => /[A-Z]/.test(password),
  lowercase: (password) => /[a-z]/.test(password),
  number: (password) => /\d/.test(password),
  special: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
};

// Validação de idade
function checkAge(birthDate) {
  // Verifica se tem pelo menos 13 anos
}
```

### Backend (auth.js)
```javascript
// Validações usando express-validator
body("firstName")
  .trim()
  .isLength({ min: 2, max: 100 })
  .withMessage("First name must be between 2 and 100 characters"),

body("password")
  .isLength({ min: 8 })
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
```

## 📡 Estrutura da API

### Request (Registro)
```json
{
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao.silva@example.com",
  "password": "MinhaSenh@123",
  "birthDate": "1990-01-15",
  "country": "PT",
  "phone": "+351912345678"
}
```

### Response (Sucesso)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-aqui",
      "firstName": "João",
      "lastName": "Silva",
      "email": "joao.silva@example.com",
      "birthDate": "1990-01-15",
      "country": "PT",
      "phone": "+351912345678",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "token": "jwt-token-aqui",
    "sessionId": "session-uuid-aqui"
  }
}
```

### Response (Erro)
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Please provide a valid email"
      }
    ]
  }
}
```

## 🚨 Tratamento de Erros

### Tipos de Erro Tratados
- **Usuário já existe**: Email já cadastrado
- **Validação falhou**: Dados inválidos
- **Timeout de conexão**: Servidor indisponível
- **Erro interno**: Problema no servidor

### Mensagens de Erro
```javascript
// Exemplos de mensagens exibidas ao usuário
"An account with this email already exists. Please try logging in instead."
"Password does not meet security requirements."
"You must be at least 13 years old to create an account."
"Connection timeout. Please check your internet connection and try again."
```

## 🔒 Segurança

### Medidas Implementadas
- **Hash de Senha**: bcrypt com 12 rounds
- **JWT Seguro**: Tokens com expiração e claims específicos
- **Validação Dupla**: Frontend e backend
- **Sanitização**: Dados limpos antes do armazenamento
- **Rate Limiting**: Proteção contra ataques de força bruta
- **HTTPS**: Recomendado para produção

## 🧪 Testes

### Cenários de Teste
1. **Registro Válido**: Todos os campos corretos
2. **Email Duplicado**: Tentar registrar email existente
3. **Senha Fraca**: Testar validações de senha
4. **Idade Inválida**: Menor de 13 anos
5. **Campos Obrigatórios**: Deixar campos em branco
6. **Timeout**: Simular falha de conexão

### Como Testar
1. Use `test-signin.html` para testes manuais
2. Verifique o console do navegador para logs detalhados
3. Teste diferentes cenários alterando os dados
4. Verifique a base de dados após registros bem-sucedidos

## 📱 Compatibilidade

### Navegadores Suportados
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Dispositivos
- Desktop (todas as resoluções)
- Tablet (768px+)
- Mobile (320px+)

## 🔄 Fluxo Completo

1. **Carregamento da Página**
   - Scripts carregados (config.js → api.js → signin.js)
   - Formulário inicializado
   - Validações configuradas

2. **Preenchimento do Formulário**
   - Validação em tempo real
   - Feedback visual imediato
   - Botão habilitado/desabilitado dinamicamente

3. **Submissão**
   - Validação final
   - Estado de loading
   - Chamada à API

4. **Resposta da API**
   - Sucesso: Redirect para login
   - Erro: Mensagem de erro exibida
   - Estado de loading removido

## 🛠️ Manutenção

### Arquivos Principais
- `signin.js`: Lógica principal do formulário
- `api.js`: Cliente da API reutilizável
- `config.js`: Configurações centralizadas

### Logs e Debug
- Console do navegador: Logs detalhados disponíveis
- Modo debug: Configurável em `APP_SETTINGS.DEBUG`
- Interceptors: Logs automáticos de requests/responses

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique o console do navegador
2. Teste com `test-signin.html`
3. Confirme se o servidor backend está rodando
4. Verifique as configurações em `config.js`

---

**Versão**: 1.0.0  
**Última Atualização**: Janeiro 2024  
**Autor**: GamePlan Development Team