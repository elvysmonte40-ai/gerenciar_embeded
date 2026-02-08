---
name: nodejs-best-practices
description: Princípios de desenvolvimento Node.js e tomada de decisão. Seleção de framework, padrões assíncronos, segurança e arquitetura. Ensina a pensar, não a copiar.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Melhores Práticas de Node.js

> Princípios e tomada de decisão para o desenvolvimento em Node.js em 2025.
> **Aprenda a PENSAR, não a decorar padrões de código.**

---

## ⚠️ Como Usar Esta Skill

Esta skill ensina **princípios de tomada de decisão**, não códigos fixos para copiar.

- PERGUNTE as preferências ao usuário quando não estiver claro
- Escolha o framework/padrão com base no CONTEXTO
- Não use a mesma solução para tudo por padrão

---

## 1. Seleção de Framework (2025)

### Árvore de Decisão

```
O que você está construindo?
│
├── Edge/Serverless (Cloudflare, Vercel)
│   └── Hono (zero-dependência, cold starts ultra rápidos)
│
├── API de Alta Performance
│   └── Fastify (2-3x mais rápido que Express)
│
├── Enterprise / Familiaridade da Equipe
│   └── NestJS (estruturado, DI, decoradores)
│
├── Legado/Estável/Ecossistema Máximo
│   └── Express (maduro, maior número de middlewares)
│
└── Full-stack com frontend
    └── Next.js API Routes ou tRPC
```

### Princípios de Comparação

| Fator | Hono | Fastify | Express |
|--------|------|---------|---------|
| **Melhor para** | Edge, serverless | Performance | Legado, aprendizado |
| **Cold start** | Mais rápido | Rápido | Moderado |
| **Ecossistema** | Em crescimento | Bom | O maior |
| **TypeScript** | Nativo | Excelente | Bom |
| **Curva de aprendizado** | Baixa | Média | Baixa |

### Perguntas de Seleção para Fazer:
1. Qual é o alvo do deploy?
2. O tempo de cold start é crítico?
3. A equipe já possui experiência prévia?
4. Existe código legado para manter?

---

## 2. Considerações de Runtime (2025)

### TypeScript Nativo

```
Node.js 22+: --experimental-strip-types
├── Execute arquivos .ts diretamente
├── Sem necessidade de etapa de build para projetos simples
└── Considere para: scripts, APIs simples
```

### Decisão do Sistema de Módulos

```
ESM (import/export)
├── Padrão moderno
├── Melhor tree-shaking
├── Carregamento de módulos assíncrono
└── Use para: novos projetos

CommonJS (require)
├── Compatibilidade com legado
├── Maior suporte de pacotes npm
└── Use para: bases de código existentes, alguns casos de borda
```

### Seleção de Runtime

| Runtime | Melhor Para |
|---------|----------|
| **Node.js** | Uso geral, maior ecossistema |
| **Bun** | Performance, bundler embutido |
| **Deno** | Segurança em primeiro lugar, TypeScript embutido |

---

## 3. Princípios de Arquitetura

### Conceito de Estrutura em Camadas

```
Fluxo da Requisição:
│
├── Camada de Controller/Rota
│   ├── Lida com especificidades de HTTP
│   ├── Validação de entrada no limite
│   └── Chama a camada de serviço
│
├── Camada de Serviço (Service Layer)
│   ├── Lógica de negócio
│   ├── Agnóstica a framework
│   └── Chama a camada de repositório
│
└── Camada de Repositório (Repository Layer)
    ├── Apenas acesso a dados
    ├── Queries de banco de dados
    └── Interações com ORM
```

### Por que isso Importa:
- **Testabilidade**: Mokeie as camadas de forma independente
- **Flexibilidade**: Troque o banco de dados sem tocar na lógica de negócio
- **Clareza**: Cada camada tem uma única responsabilidade

### Quando Simplificar:
- Scripts pequenos → Único arquivo está OK
- Protótipos → Menos estrutura é aceitável
- Sempre pergunte: "Isso vai crescer?"

---

## 4. Princípios de Tratamento de Erros

### Tratamento Centralizado de Erros

```
Padrão:
├── Crie classes de erro customizadas
├── Lance erros de qualquer camada
├── Capture no nível superior (middleware)
└── Formate uma resposta consistente
```

### Filosofia de Resposta de Erro

```
O Cliente recebe:
├── Status HTTP apropriado
├── Código de erro para manipulação programática
├── Mensagem amigável ao usuário
└── SEM detalhes internos (segurança!)

Os Logs recebem:
├── Stack trace completo
├── Contexto da requisição
├── ID do usuário (se aplicável)
└── Timestamp
```

### Seleção de Código de Status

| Situação | Status | Quando |
|-----------|--------|------|
| Entrada ruim | 400 | Cliente enviou dados inválidos |
| Sem auth | 401 | Credenciais ausentes ou inválidas |
| Sem permissão | 403 | Auth válido, mas não permitido |
| Não encontrado | 404 | Recurso não existe |
| Conflito | 409 | Duplicata ou conflito de estado |
| Validação | 422 | Schema válido, mas regras de negócio falham |
| Erro de servidor | 500 | Nossa falha, logue tudo |

---

## 5. Princípios de Padrões Assíncronos

### Quando Usar Cada Um

| Padrão | Use Quando |
|---------|----------|
| `async/await` | Operações assíncronas sequenciais |
| `Promise.all` | Operações independentes em paralelo |
| `Promise.allSettled` | Paralelo onde algumas podem falhar |
| `Promise.race` | Timeout ou a primeira resposta vence |

### Consciência do Event Loop

```
I/O-bound (async ajuda):
├── Queries de banco de dados
├── Requisições HTTP
├── Sistema de arquivos (File system)
└── Operações de rede

CPU-bound (async não ajuda):
├── Operações de criptografia (Crypto)
├── Processamento de imagem
├── Cálculos complexos
└── → Use worker threads ou descarregue (offload)
```

### Evitando o Bloqueio do Event Loop

- Nunca use métodos síncronos em produção (fs.readFileSync, etc.)
- Descarregue o trabalho intensivo de CPU
- Use streaming para grandes volumes de dados

---

## 6. Princípios de Validação

### Validar nos Limites

```
Onde validar:
├── Ponto de entrada da API (request body/params)
├── Antes de operações no banco de dados
├── Dados externos (respostas de API, upload de arquivos)
└── Variáveis de ambiente (na inicialização)
```

### Seleção de Biblioteca de Validação

| Biblioteca | Melhor Para |
|---------|----------|
| **Zod** | TypeScript em primeiro lugar, inferência |
| **Valibot** | Bundle menor (tree-shakeable) |
| **ArkType** | Crítico para performance |
| **Yup** | Uso existente de formulários React |

### Filosofia de Validação

- Falhe rápido: Valide cedo
- Seja específico: Mensagens de erro claras
- Não confie: Nem mesmo em dados "internos"

---

## 7. Princípios de Segurança

### Checklist de Segurança (Não é Código)

- [ ] **Validação de input**: Todas as entradas validadas
- [ ] **Parameterized queries**: Sem concatenação de strings para SQL
- [ ] **Hash de senha**: bcrypt ou argon2
- [ ] **Verificação de JWT**: Sempre verifique a assinatura e expiração
- [ ] **Rate limiting**: Proteger contra abusos
- [ ] **Headers de segurança**: Helmet.js ou equivalente
- [ ] **HTTPS**: Em todo lugar em produção
- [ ] **CORS**: Configurado corretamente
- [ ] **Segredos (Secrets)**: Apenas variáveis de ambiente
- [ ] **Dependências**: Auditadas regularmente

### Mentalidade de Segurança

```
Não confie em nada:
├── Query params → validar
├── Request body → validar
├── Headers → verificar
├── Cookies → validar
├── Uploads de arquivo → escanear
└── APIs externas → validar resposta
```

---

## 8. Princípios de Teste

### Seleção de Estratégia de Teste

| Tipo | Propósito | Ferramentas |
|------|---------|-------|
| **Unitário** | Lógica de negócio | node:test, Vitest |
| **Integração** | Endpoints de API | Supertest |
| **E2E** | Fluxos completos | Playwright |

### O que Testar (Prioridades)

1. **Caminhos críticos**: Auth, pagamentos, core do negócio
2. **Casos de borda**: Entradas vazias, limites
3. **Tratamento de erros**: O que acontece quando as coisas falham?
4. **Não vale o esforço**: Código do framework, getters triviais

### Test Runner Embutido (Node.js 22+)

```
node --test src/**/*.test.ts
├── Sem dependência externa
├── Bom relatório de cobertura
└── Modo watch disponível
```

---

## 10. Anti-Padrões a Evitar

### ❌ NÃO FAÇA:
- Usar Express para novos projetos edge (use Hono)
- Usar métodos síncronos em código de produção
- Colocar lógica de negócio nos controllers
- Pular a validação de entrada
- Hardcode de segredos
- Confiar em dados externos sem validação
- Bloquear o event loop com trabalho de CPU

### ✅ FAÇA:
- Escolha o framework com base no contexto
- Peça preferências ao usuário quando não estiver claro
- Use arquitetura em camadas para projetos que tendem a crescer
- Valide todas as entradas
- Use variáveis de ambiente para segredos
- Faça o profiling antes de otimizar

---

## 11. Checklist de Decisão

Antes de implementar:

- [ ] **Perguntou as preferências de stack ao usuário?**
- [ ] **Escolheu o framework para ESTE contexto?** (não apenas o padrão)
- [ ] **Considerou o alvo do deploy?**
- [ ] **Planejou a estratégia de tratamento de erros?**
- [ ] **Identificou os pontos de validação?**
- [ ] **Considerou os requisitos de segurança?**

---

> **Lembre-se**: As melhores práticas de Node.js tratam de tomada de decisão, não de decorar padrões. Cada projeto merece uma nova consideração baseada em seus requisitos.
