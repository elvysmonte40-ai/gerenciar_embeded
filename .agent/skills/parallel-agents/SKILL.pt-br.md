---
name: parallel-agents
description: Padrões de orquestração multi-agente. Use quando múltiplas tarefas independentes puderem ser executadas com diferentes especialidades de domínio ou quando uma análise abrangente exigir múltiplas perspectivas.
allowed-tools: Read, Glob, Grep
---

# Agentes em Paralelo (Parallel Agents)

> Orquestração através da Ferramenta de Agentes nativa do Antigravity

## Visão Geral

Esta skill permite coordenar múltiplos agentes especializados através do sistema nativo de agentes do Antigravity. Esta abordagem mantém toda a orquestração sob o controle do Antigravity.

## Quando Usar Orquestração

✅ **Bom para:**
- Tarefas complexas que exigem múltiplos domínios de expertise.
- Análise de código sob as perspectivas de segurança, performance e qualidade.
- Revisões abrangentes (arquitetura + segurança + testes).
- Implementação de recursos que precisam de trabalho em backend + frontend + banco de dados.

❌ **Não indicado para:**
- Tarefas simples de domínio único.
- Correções rápidas ou pequenas alterações.
- Tarefas onde um único agente é suficiente.

---

## Invocação de Agentes Nativa

### Agente Único
```
Use o agente security-auditor para revisar a autenticação
```

### Cadeia Sequencial
```
Primeiro, use o explorer-agent para descobrir a estrutura do projeto.
Depois, use o backend-specialist para revisar os endpoints da API.
Finalmente, use o test-engineer para identificar lacunas de teste.
```

### Com Passagem de Contexto
```
Use o frontend-specialist para analisar os componentes React.
Com base nesses achados, peça ao test-engineer para gerar testes de componentes.
```

---

## Padrões de Orquestração

### Padrão 1: Análise Abrangente
Agentes: explorer-agent → [agentes-de-dominio] → síntese.
1. explorer-agent: Mapeia estrutura da codebase.
2. [Especialistas]: Analisam segurança, API, UI/UX, testes.
3. Síntese de todos os achados.

### Padrão 2: Revisão de Funcionalidade
Agentes: agentes-de-dominio-afetados → test-engineer.
1. Identifica domínios afetados.
2. Invoca agentes relevantes.
3. test-engineer verifica as mudanças.

---

## Lista de Agentes Especializados (Resumo)

- `orchestrator`: Coordenação abrangente.
- `security-auditor`: Segurança e vulnerabilidades.
- `backend-specialist`: API, servidor, Node.js.
- `frontend-specialist`: React, UI, componentes.
- `test-engineer`: Testes, cobertura.
- `devops-engineer`: Deploy, infraestrutura.
- `database-architect`: Banco de dados, schema, migrations.
- `mobile-developer`: React Native, Flutter, mobile.
- `debugger`: Correção de bugs e erros.
- `explorer-agent`: Exploração e mapeamento.
- `documentation-writer`: Documentação e README.
- `performance-optimizer`: Otimização e performance.
- `project-planner`: Planejamento e roadmap.
- `seo-specialist`: SEO e metatags.

---

## Protocolo de Síntese

Após a conclusão de todos os agentes, sintetize os achados em um único relatório estruturado, destacando:
1. Resumo da Tarefa.
2. Contribuições de cada Agente.
3. Recomendações Consolidadas (Crítico, Importante, Desejável).
4. Próximas Ações (Checklist).

---

## Melhores Práticas
1. Ordem lógica: Descoberta → Análise → Implementação → Testes.
2. Compartilhamento de Contexto entre os agentes.
3. Síntese Única: Um relatório unificado em vez de saídas separadas.
4. Sempre inclua o `test-engineer` para modificações de código.
