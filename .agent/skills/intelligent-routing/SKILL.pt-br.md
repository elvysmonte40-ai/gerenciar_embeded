---
name: intelligent-routing
description: Seleção automática de agentes e roteamento inteligente de tarefas. Analisa as solicitações do usuário e seleciona automaticamente o(s) melhor(es) agente(s) especialista(s) sem a necessidade de menções explícitas.
version: 1.0.0
---

# Roteamento Inteligente de Agentes (Intelligent Agent Routing)

**Propósito**: Analisar automaticamente as solicitações do usuário e roteá-las para o(s) agente(s) especialista(s) mais apropriado(s) sem a necessidade de menções explícitas por parte do usuário.

## Princípio Central

> **A IA deve agir como um Gerente de Projeto inteligente**, analisando cada solicitação e selecionando automaticamente o(s) melhor(es) especialista(s) para o trabalho.

## Como Funciona

### 1. Análise da Solicitação
Antes de responder a QUALQUER solicitação do usuário, realize uma análise automática de palavras-chave, domínio e complexidade para selecionar o agente ideal.

### 2. Matriz de Seleção de Agentes

| Intenção do Usuário | Palavras-chave | Agente(s) Selecionado(s) | Invocar Auto? |
| ------------------- | ------------------------------------------ | ------------------------------------------- | ------------ |
| **Autenticação** | login, auth, signup, senha | `security-auditor` + `backend-specialist` | ✅ SIM |
| **Componente de UI** | botão, card, layout, estilo | `frontend-specialist` | ✅ SIM |
| **UI Mobile** | tela, navegação, toque, gesto | `mobile-developer` | ✅ SIM |
| **API / Endpoint** | rota, API, POST, GET, endpoint | `backend-specialist` | ✅ SIM |
| **Banco de Dados** | schema, migration, query, tabela | `database-architect` + `backend-specialist` | ✅ SIM |
| **Correção de Bug** | erro, bug, não funciona, quebrado | `debugger` | ✅ SIM |
| **Testes** | teste, cobertura, unitário, e2e | `test-engineer` | ✅ SIM |
| **Deploy** | deploy, produção, CI/CD, docker | `devops-engineer` | ✅ SIM |
| **Segurança** | vulnerabilidade, exploit, segurança | `security-auditor` + `penetration-tester` | ✅ SIM |
| **Performance** | lento, otimizar, velocidade | `performance-optimizer` | ✅ SIM |
| **Nova Funcionalidade** | construir, criar, implementar | `orchestrator` → multi-agente | ⚠️ PERGUNTE |

---

## 3. Formato de Resposta

**Ao selecionar automaticamente um agente, informe o usuário de forma concisa:**

```markdown
🤖 **Aplicando conhecimentos de `@security-auditor` + `@backend-specialist`...**

[Prossiga com a resposta especializada]
```

## 4. Avaliação de Complexidade

- **SIMPLES**: Edição de arquivo único, domínio único. Ação: Invocar agente direto.
- **MODERADA**: 2 a 3 arquivos afetados, requisitos claros, no máximo 2 domínios. Ação: Invocar agentes sequencialmente.
- **COMPLEXA**: Múltiplos arquivos/domínios, decisões arquitetônicas necessárias. Ação: Invocar `orchestrator` (que fará perguntas socráticas).

---

## Regras de Implementação

1. **Análise Silenciosa**: NÃO anuncie "Estou analisando sua solicitação...". Faça isso silenciosamente.
2. **Informe a Seleção**: Informe QUAL especialidade está sendo aplicada (ex: `@frontend-specialist`).
3. **Experiência Fluida**: O usuário deve sentir que está falando com o especialista certo diretamente.
4. **Capacidade de Sobrescrita**: O usuário ainda pode mencionar agentes explicitamente (ex: "@backend-specialist revise isso"), o que sobrescreve a seleção automática.

---

## Integração

- **Com o Comando /orchestrate**: O roteamento automático torna o uso do comando opcional, mas o resultado é o mesmo.
- **Com o Socratic Gate**: O roteamento automático NÃO ignora o portão socrático. Se a tarefa for vaga, pergunte primeiro.
- **Com o GEMINI.md**: As regras do `GEMINI.md` têm prioridade sobre o roteamento inteligente.

---

**Resumo**: Esta skill permite operação sem comandos, seleção automática de especialistas, comunicação transparente e integração fluida.
