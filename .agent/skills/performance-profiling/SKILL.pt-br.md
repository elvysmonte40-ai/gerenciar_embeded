---
name: performance-profiling
description: Princípios de profiling de performance. Técnicas de medição, análise e otimização.
allowed-tools: Read, Glob, Grep, Bash
---

# Profiling de Performance (Performance Profiling)

> Meça, analise, otimize - nessa ordem.

---

## 🔧 Scripts de Runtime

Execute estes para profiling automatizado:

| Script | Propósito | Uso |
|--------|---------|-------|
| `scripts/lighthouse_audit.py` | Auditoria de performance do Lighthouse | `python scripts/lighthouse_audit.py https://exemplo.com` |

---

## 1. Core Web Vitals (Métricas de Performance)

- **LCP** (Largest Contentful Paint): Carregamento (< 2.5s).
- **INP** (Interaction to Next Paint): Interatividade (< 200ms).
- **CLS** (Cumulative Layout Shift): Estabilidade visual (< 0.1).

---

## 2. Fluxo de Trabalho (Profiling Workflow)

1. **BASELINE**: Meça o estado atual.
2. **IDENTIFICAR**: Encontre o gargalo.
3. **CORRIGIR**: Faça uma mudança direcionada.
4. **VALIDAR**: Confirme a melhora.

---

## 3. Análise de Bundle e Runtime

- **Bundle**: Procure por dependências grandes, código duplicado, código não utilizado e falta de code-splitting.
- **Runtime**: No DevTools, analise tarefas longas (>50ms) que bloqueiam a UI, uso excessivo de memória (leaks) e gargalos de renderização (layout/paint).

---

## 4. Prioridades para Ganhos Rápidos

1. Habilitar compressão.
2. Lazy loading de imagens.
3. Code splitting em rotas.
4. Cache de assets estáticos.
5. Otimização de imagens.

---

## 5. Anti-Padrões (NÃO FAÇA)

- Tentar adivinhar os problemas (meça primeiro).
- Micro-otimizar detalhes insignificantes (foque no maior problema).
- Otimizar cedo demais (optimize when needed).
- Ignorar os dados dos usuários REAIS.

---

> **Lembre-se:** O código mais rápido é aquele que não roda. Remova antes de otimizar.
