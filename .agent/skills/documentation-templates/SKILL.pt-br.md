---
name: documentation-templates
description: Templates de documentação e diretrizes de estrutura. README, docs de API, comentários de código e documentação amigável para IA.
allowed-tools: Read, Glob, Grep
---

# Templates de Documentação (Documentation Templates)

> Diretrizes de estrutura para tipos comuns de documentação.

---

## 1. Estrutura do README

Um bom README deve ter:
- **Título + Descrição de uma linha** (O que é isso?).
- **Quick Start** (Como rodar em < 5 min).
- **Funcionalidades** (O que eu posso fazer?).
- **Configuração** (Como customizar).
- **Referência de API** e links para documentação detalhada.
- **Licença**.

---

## 2. Documentação de API e Comentários

- **API**: Documente por endpoint, incluindo parâmetros obrigatórios, tipos, códigos de resposta (200, 404, etc.) e exemplos de requisição/resposta.
- **Comentários**: Use JSDoc/TSDoc para descrever funções, parâmetros e retornos. Comente o **PORQUÊ** (lógica de negócio/algoritmos complexos) e não o **O QUE** (o código óbvio).

---

## 3. Registro de Decisão de Arquitetura (ADR)

Use ADRs para registrar decisões importantes:
- **Status**: Aceito / Depreciado / Substituído.
- **Contexto**: Por que estamos tomando esta decisão?
- **Decisão**: O que decidimos?
- **Consequências**: Quais são os trade-offs?

---

## 4. Documentação Amigável para IA (2025)

Crie arquivos `llms.txt` para crawlers e agentes de IA, listando arquivos principais e conceitos chave de forma concisa. Use diagramas Mermaid para fluxos e mantenha uma hierarquia clara de cabeçalhos (H1-H3).

---

## 5. Princípios de Estrutura

- **Escaneável**: Use cabeçalhos, listas e tabelas.
- **Exemplos primeiro**: Mostre como funciona antes de explicar.
- **Detalhe progressivo**: Do simples ao complexo.
- **Atualizado**: Documentação desatualizada é pior do que nenhuma.

---

> **Lembre-se:** Templates são pontos de partida. Adapte-os às necessidades do seu projeto.
