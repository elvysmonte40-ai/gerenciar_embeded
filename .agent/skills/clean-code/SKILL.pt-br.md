---
name: clean-code
description: Padrões de codificação pragmáticos - conciso, direto, sem excesso de engenharia, sem comentários desnecessários
allowed-tools: Read, Write, Edit
version: 2.0
priority: CRITICAL
---

# Clean Code - Padrões de Codificação Pragmática para IA

> **SKILL CRÍTICA** - Seja **conciso, direto e focado na solução**.

---

## Princípios Centrais

| Princípio | Regra |
|-----------|------|
| **SRP** | Responsabilidade Única - cada função/classe faz UMA coisa |
| **DRY** | Don't Repeat Yourself (Não se repita) - extraia duplicatas, reutilize |
| **KISS** | Keep It Simple (Mantenha simples) - a solução mais simples que funciona |
| **YAGNI** | You Aren't Gonna Need It (Você não vai precisar disso) - não construa recursos não utilizados |
| **Regra do Escoteiro** | Deixe o código mais limpo do que o encontrou |

---

## Regras de Nomenclatura

| Elemento | Convenção |
|---------|------------|
| **Variáveis** | Revelam intenção: `userCount` em vez de `n` |
| **Funções** | Verbo + substantivo: `getUserById()` em vez de `user()` |
| **Booleanos** | Forma de pergunta: `isActive`, `hasPermission`, `canEdit` |
| **Constantes** | SCREAMING_SNAKE: `MAX_RETRY_COUNT` |

> **Regra:** Se você precisar de um comentário para explicar um nome, renomeie-o.

---

## Regras para Funções

| Regra | Descrição |
|------|-------------|
| **Pequena** | Máximo 20 linhas, idealmente 5-10 |
| **Uma Coisa** | Faz uma coisa e faz bem |
| **Um Nível** | Um nível de abstração por função |
| **Poucos Args** | Máximo 3 argumentos, preferência 0-2 |
| **Sem Efeitos Colaterais** | Não sofra mutações inesperadas nos inputs |

---

## Estrutura do Código

| Padrão | Aplicação |
|---------|-------|
| **Cláusulas de Guarda** | Retornos antecipados para casos de borda |
| **Flat > Nested** | Evite aninhamento profundo (máximo 2 níveis) |
| **Composição** | Funções pequenas compostas juntas |
| **Colocalização** | Mantenha o código relacionado próximo |

---

## Estilo de Codificação da IA

| Situação | Ação |
|-----------|--------|
| Usuário pede recurso | Escreva-o diretamente |
| Usuário relata bug | Corrija-o, não explique |
| Sem requisito claro | Pergunte, não presuma |

---

## Anti-Padrões (NÃO FAÇA)

| ❌ Padrão | ✅ Correção |
|-----------|-------|
| Comentar cada linha | Delete comentários óbvios |
| Helper para uma única linha | Deixe o código inline |
| Factory para 2 objetos | Instanciação direta |
| utils.ts com 1 função | Coloque o código onde é usado |
| "Primeiro vamos importar..." | Apenas escreva o código |
| Aninhamento profundo | Cláusulas de guarda |
| Números mágicos | Constantes nomeadas |
| God functions (Funções Deus) | Divida por responsabilidade |

---

## 🔴 Antes de Editar QUALQUER Arquivo (PENSE PRIMEIRO!)

**Antes de alterar um arquivo, pergunte-se:**

| Pergunta | Por quê |
|----------|-----|
| **O que importa este arquivo?** | Eles podem quebrar |
| **O que este arquivo importa?** | Mudanças de interface |
| **Quais testes cobrem isso?** | Os testes podem falhar |
| **Este é um componente compartilhado?** | Múltiplos lugares afetados |

**Checagem Rápida:**
```
Arquivo para editar: UserService.ts
└── Quem importa isso? → UserController.ts, AuthController.ts
└── Eles também precisam de mudanças? → Verifique as assinaturas das funções
```

> 🔴 **Regra:** Edite o arquivo + todos os arquivos dependentes na MESMA tarefa.
> 🔴 **Nunca deixe imports quebrados ou atualizações faltando.**

---

## Resumo

| Faça | Não Faça |
|----|-------|
| Escreva código diretamente | Escreva tutoriais |
| Deixe o código se auto-documentar | Adicione comentários óbvios |
| Corrija bugs imediatamente | Explique a correção primeiro |
| Deixe coisas pequenas inline | Crie arquivos desnecessários |
| Nomeie as coisas claramente | Use abreviações |
| Mantenha funções pequenas | Escreva funções com mais de 100 linhas |

> **Lembre-se: O usuário quer código funcionando, não uma lição de programação.**

---

## 🔴 Auto-Checagem Antes de Concluir (OBRIGATÓRIO)

**Antes de dizer "tarefa concluída", verifique:**

| Checagem | Pergunta |
|-------|----------|
| ✅ **Objetivo atingido?** | Fiz exatamente o que o usuário pediu? |
| ✅ **Arquivos editados?** | Modifiquei todos os arquivos necessários? |
| ✅ **Código funciona?** | Testei/verifiquei a alteração? |
| ✅ **Sem erros?** | Lint e TypeScript passam? |
| ✅ **Nada esquecido?** | Algum caso de borda passou batido? |

> 🔴 **Regra:** Se QUALQUER checagem falhar, corrija antes de concluir.

---

## Scripts de Verificação (OBRIGATÓRIO)

> 🔴 **CRÍTICO:** Cada agente executa APENAS os scripts de sua própria skill após concluir o trabalho.

### Mapeamento Agente → Script

| Agente | Script | Comando |
|-------|--------|---------|
| **frontend-specialist** | Auditoria UX | `python .agent/skills/frontend-design/scripts/ux_audit.py .` |
| **frontend-specialist** | Check A11y | `python .agent/skills/frontend-design/scripts/accessibility_checker.py .` |
| **backend-specialist** | Validador API | `python .agent/skills/api-patterns/scripts/api_validator.py .` |
| **mobile-developer** | Auditoria Mobile | `python .agent/skills/mobile-design/scripts/mobile_audit.py .` |
| **database-architect** | Validação de Schema | `python .agent/skills/database-design/scripts/schema_validator.py .` |
| **security-auditor** | Scan de Segurança | `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .` |
| **seo-specialist** | Check SEO | `python .agent/skills/seo-fundamentals/scripts/seo_checker.py .` |
| **seo-specialist** | Check GEO | `python .agent/skills/geo-fundamentals/scripts/geo_checker.py .` |
| **performance-optimizer** | Lighthouse | `python .agent/skills/performance-profiling/scripts/lighthouse_audit.py <url>` |
| **test-engineer** | Runner de Teste | `python .agent/skills/testing-patterns/scripts/test_runner.py .` |
| **test-engineer** | Playwright | `python .agent/skills/webapp-testing/scripts/playwright_runner.py <url>` |
| **Qualquer agente** | Check de Lint | `python .agent/skills/lint-and-validate/scripts/lint_runner.py .` |
| **Qualquer agente** | Cobertura de Tipos | `python .agent/skills/lint-and-validate/scripts/type_coverage.py .` |
| **Qualquer agente** | Check de i18n | `python .agent/skills/i18n-localization/scripts/i18n_checker.py .` |

---

### 🔴 Tratamento de Saída de Script (LER → RESUMIR → PERGUNTAR)

**Ao executar um script de validação, você DEVE:**

1. **Executar o script** e capturar TODA a saída
2. **Analisar a saída** - identificar erros, avisos e sucessos
3. **Resumir para o usuário** neste formato:

```markdown
## Resultados do Script: [nome_do_script.py]

### ❌ Erros Encontrados (X itens)
- [Arquivo:Linha] Descrição do erro 1
- [Arquivo:Linha] Descrição do erro 2

### ⚠️ Avisos (Y itens)
- [Arquivo:Linha] Descrição do aviso

### ✅ Passou (Z itens)
- Check 1 passou
- Check 2 passou

**Devo corrigir os X erros?**
```

4. **Aguardar a confirmação do usuário** antes de corrigir
5. **Após corrigir** → Execute o script novamente para confirmar

> 🔴 **VIOLAÇÃO:** Executar script e ignorar a saída = tarefa FALHA.
> 🔴 **VIOLAÇÃO:** Auto-correção sem perguntar = Não permitido.
> 🔴 **Regra:** Sempre LEIA a saída → RESUMA → PERGUNTE → depois corrija.
