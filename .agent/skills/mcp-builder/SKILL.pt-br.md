---
name: mcp-builder
description: Princípios de construção de servidores MCP (Model Context Protocol). Design de ferramentas, padrões de recursos e melhores práticas.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Construtor MCP (MCP Builder)

> Princípios para construção de servidores MCP.

---

## 1. Visão Geral do MCP

O **Model Context Protocol** (MCP) é um padrão para conectar sistemas de IA com ferramentas e fontes de dados externas.
- **Ferramentas (Tools)**: Funções que a IA pode chamar.
- **Recursos (Resources)**: Dados que a IA pode ler.
- **Prompts**: Templates de prompts pré-definidos.

---

## 2. Design de Ferramentas (Tools)

Uma boa ferramenta deve ter um nome claro e orientado à ação (ex: `get_weather`), propósito único e bem definido, entradas validadas via schema e saída estruturada e previsível. No schema de entrada, forneça descrições legíveis por humanos para cada parâmetro.

---

## 3. Padrões de Recursos (Resources)

- **Estáticos**: Dados fixos como configurações ou documentação.
- **Dinâmicos**: Gerados sob demanda.
- **Templates**: URIs com parâmetros (ex: `users://{userId}`).

---

## 4. Tratamento de Erros e Segurança

- Retorne erros estruturados e mensagens acionáveis (ex: Parâmetros inválidos, Não encontrado). Não exponha detalhes internos nos erros.
- **Segurança**: Valide e sanitize todas as entradas. Armazene chaves de API em variáveis de ambiente e limite o acesso aos recursos do sistema.

---

## 5. Checklist de Melhores Práticas

- [ ] Nomes de ferramentas claros e orientados à ação.
- [ ] Schemas de entrada completos com descrições.
- [ ] Saída JSON estruturada.
- [ ] Tratamento de erros para todos os casos.
- [ ] Validação de entrada e configuração baseada em ambiente.

---

> **Lembre-se:** Ferramentas MCP devem ser simples, focadas e bem documentadas. A IA depende das descrições para usá-las corretamente.
