---
name: react-best-practices
description: Otimização de performance de React e Next.js pela Vercel Engineering. Use ao construir componentes React, otimizar a performance, eliminar waterfalls, reduzir o tamanho do bundle, revisar código para problemas de performance ou implementar otimizações server/client-side.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Especialista em Performance de Next.js & React

> **Pela Vercel Engineering** - 57 regras de otimização priorizadas por impacto
> **Filosofia:** Elimine waterfalls primeiro, otimize bundles em segundo, depois faça micro-otimizações.

---

## 🎯 Regra de Leitura Seletiva (OBRIGATÓRIO)

**Leia APENAS as seções relevantes para a sua tarefa!** Verifique o mapa de conteúdo abaixo e carregue o que você precisa.

> 🔴 **Para revisões de performance: Comece pelas seções CRÍTICAS (1-2), depois passe para HIGH/MEDIUM.**

---

## 📑 Mapa de Conteúdo

| Arquivo | Impacto | Regras | Quando Ler |
| --------------------------------------- | ------------------ | -------- | --------------------------------------------------------------- |
| `1-async-eliminating-waterfalls.md` | 🔴 **CRÍTICO** | 5 regras | Carregamento de página lento, chamadas de API sequenciais, waterfalls de busca de dados |
| `2-bundle-bundle-size-optimization.md` | 🔴 **CRÍTICO** | 5 regras | Tamanho de bundle grande, Time to Interactive (TTI) lento, problemas de First Load |
| `3-server-server-side-performance.md` | 🟠 **ALTO** | 7 regras | SSR lento, otimização de rotas de API, waterfalls no lado do servidor |
| `4-client-client-side-data-fetching.md` | 🟡 **MÉDIO-ALTO** | 4 regras | Gerenciamento de dados no cliente, padrões SWR, deduplicação |
| `5-rerender-re-render-optimization.md` | 🟡 **MÉDIO** | 12 regras | Re-renders excessivos, performance do React, memoização |
| `6-rendering-rendering-performance.md` | 🟡 **MÉDIO** | 9 regras | Gargalos de renderização, virtualização, otimização de imagem |
| `7-js-javascript-performance.md` | ⚪ **BAIXO-MÉDIO** | 12 regras | Micro-otimizações, cache, performance de loops |
| `8-advanced-advanced-patterns.md` | 🔵 **VARIÁVEL** | 3 regras | Padrões avançados de React, useLatest, init-once |

**Total: 57 regras em 8 categorias**

---

## 🚀 Árvore de Decisão Rápida

**Qual é o seu problema de performance?**

```
🐌 Carregamento de página lento / TTI longo
  → Leia a Seção 1: Eliminating Waterfalls
  → Leia a Seção 2: Bundle Size Optimization

📦 Tamanho de bundle excessivo (> 200KB)
  → Leia a Seção 2: Bundle Size Optimization
  → Verifique: Imports dinâmicos, barrel imports, tree-shaking

🖥️ Renderização no Servidor (SSR) lenta
  → Leia a Seção 3: Server-Side Performance
  → Verifique: Busca de dados em paralelo, streaming

🔄 Excesso de re-renders / Lag na UI
  → Leia a Seção 5: Re-render Optimization
  → Verifique: React.memo, useMemo, useCallback

🎨 Problemas de performance de renderização
  → Leia a Seção 6: Rendering Performance
  → Verifique: Virtualização, layout thrashing

🌐 Problemas de busca de dados no lado do cliente
  → Leia a Seção 4: Client-Side Data Fetching
  → Verifique: Deduplicação SWR, localStorage

✨ Preciso de padrões avançados
  → Leia a Seção 8: Advanced Patterns
```

---

## 📊 Guia de Prioridade de Impacto

**Use esta ordem ao fazer uma otimização abrangente:**

```
1️⃣ CRÍTICO (Maiores ganhos - Faça primeiro):
   ├─ Seção 1: Eliminating Waterfalls
   │  └─ Cada waterfall adiciona latência total de rede (100-500ms+)
   └─ Seção 2: Bundle Size Optimization
      └─ Afeta o Time to Interactive (TTI) e o Largest Contentful Paint (LCP)

2️⃣ ALTO (Impacto Significativo - Faça em segundo):
   └─ Seção 3: Server-Side Performance
      └─ Elimina waterfalls no lado do servidor, respostas mais rápidas

3️⃣ MÉDIO (Ganhos Moderados - Faça em terceiro):
   ├─ Seção 4: Client-Side Data Fetching
   ├─ Seção 5: Re-render Optimization
   └─ Seção 6: Rendering Performance

4️⃣ BAIXO (Polimento - Faça por último):
   ├─ Seção 7: JavaScript Performance
   └─ Seção 8: Advanced Patterns
```

---

## 🔗 Skills Relacionadas

| Necessidade | Skill |
| ----------------------- | --------------------------------- |
| Padrões de design de API | `@[skills/api-patterns]` |
| Otimização de banco de dados | `@[skills/database-design]` |
| Estratégias de teste | `@[skills/testing-patterns]` |
| Princípios de design UI/UX | `@[skills/frontend-design]` |
| Padrões de TypeScript | `@[skills/typescript-expert]` |
| Deploy e DevOps | `@[skills/deployment-procedures]` |

---

## ✅ Checklist de Revisão de Performance

Antes de enviar para produção:

**Crítico (Deve Corrigir):**
- [ ] Sem busca de dados sequencial (waterfalls eliminados)
- [ ] Tamanho do bundle < 200KB para o bundle principal
- [ ] Sem barrel imports no código da aplicação
- [ ] Imports dinâmicos usados para componentes grandes
- [ ] Busca de dados em paralelo onde for possível

**Alta Prioridade:**
- [ ] Server components usados onde apropriado
- [ ] Rotas de API otimizadas (sem N+1 queries)
- [ ] Suspense boundaries para busca de dados
- [ ] Geração estática (Static generation) usada onde possível

**Média Prioridade:**
- [ ] Computações pesadas memoizadas
- [ ] Renderização de listas virtualizada (se > 100 itens)
- [ ] Imagens otimizadas com next/image
- [ ] Sem re-renders desnecessários

**Baixa Prioridade (Polimento):**
- [ ] Loops em "hot paths" otimizados
- [ ] Padrões de RegExp movidos para fora (hoisted)
- [ ] Acesso a propriedades cacheado em loops

---

## ❌ Anti-Padrões (Erros Comuns)

**NÃO FAÇA:**
- ❌ Usar `await` sequencial para operações independentes
- ❌ Importar bibliotecas inteiras quando precisa de apenas uma função
- ❌ Usar barrel exports (re-exports em `index.ts`) no código da aplicação
- ❌ Pular imports dinâmicos para componentes/bibliotecas grandes
- ❌ Buscar dados em `useEffect` sem deduplicação
- ❌ Esquecer de memoizar computações caras
- ❌ Usar client components quando server components funcionam

**FAÇA:**
- ✅ Busque dados em paralelo com `Promise.all()`
- ✅ Use imports dinâmicos: `const Comp = dynamic(() => import('./Heavy'))`
- ✅ Importe diretamente: `import { specific } from 'library/specific'`
- ✅ Use Suspense boundaries para melhor UX
- ✅ Aproveite React Server Components
- ✅ Meça a performance antes de otimizar
- ✅ Use as otimizações embutidas do Next.js (next/image, next/font)

---

## 🎯 Como Usar Esta Skill

### Para Novos Recursos:
1. Verifique as **Seções 1 e 2** durante a construção (evite waterfalls, mantenha o bundle pequeno)
2. Use server components por padrão (Seção 3)
3. Aplique memoização para operações pesadas (Seção 5)

### Para Revisões de Performance:
1. Comece pela **Seção 1** (waterfalls = maior impacto)
2. Depois a **Seção 2** (tamanho do bundle)
3. Depois a **Seção 3** (lado do servidor)
4. Por fim, as outras seções conforme necessário

---

## 🔍 Script de Validação

| Script | Propósito | Comando |
| -------------------------------------- | --------------------------- | ------------------------------------------------------------ |
| `scripts/react_performance_checker.py` | Auditoria de performance automatizada | `python scripts/react_performance_checker.py <caminho_do_projeto>` |

---

## 🎓 Resumo de Melhores Práticas

**Regras de Ouro:**
1. **Meça primeiro** - Use o Profiler do React DevTools e o Chrome DevTools
2. **Maior impacto primeiro** - Waterfalls → Bundle → Servidor → Micro
3. **Não otimize demais** - Foque nos gargalos reais
4. **Use os recursos da plataforma** - O Next.js já possui otimizações embutidas
5. **Pense nos usuários** - Condições do mundo real importam

**Vercel Engineering - Janeiro 2026**
