---
name: brainstorming
description: Protocolo de questionamento socrático + comunicação com o usuário. OBRIGATÓRIO para solicitações complexas, novos recursos ou requisitos pouco claros. Inclui relatórios de progresso e tratamento de erros.
allowed-tools: Read, Glob, Grep
---

# Protocolo de Brainstorming & Comunicação

> **OBRIGATÓRIO:** Use para solicitações complexas/vagas, novos recursos e atualizações.

---

## 🛑 PORTÃO SOCRÁTICO (SOCRATIC GATE) - EXUCOÇÃO

### Quando Ativar

| Padrão | Ação |
|---------|--------|
| "Construa/Crie/Faça [coisa]" sem detalhes | 🛑 FAÇA 3 perguntas |
| Funcionalidade ou arquitetura complexa | 🛑 Esclareça antes de implementar |
| Solicitação de atualização/mudança | 🛑 Confirme o escopo |
| Requisitos vagos | 🛑 Pergunte propósito, usuários, restrições |

### 🚫 OBRIGATÓRIO: 3 Perguntas Antes da Implementação

1. **PARE** - NÃO comece a codificar.
2. **PERGUNTE** - No mínimo 3 perguntas:
   - 🎯 Propósito: Que problema você está resolvendo?
   - 👥 Usuários: Quem usará isso?
   - 📦 Escopo: O que é essencial (must-have) vs desejável (nice-to-have)?
3. **AGUARDE** - Obtenha a resposta antes de prosseguir.

---

## 🧠 Geração Dinâmica de Perguntas

**⛔ NUNCA use templates estáticos.** Leia `dynamic-questioning.md` para os princípios.

### Princípios de Geração
- As perguntas revelam consequências arquitetônicas.
- Entenda o contexto (novo projeto/refatoração/debug) primeiro.
- Cada pergunta deve eliminar ou confirmar caminhos de implementação.
- Gere dados através de trade-offs, não presuma.

### Formato da Pergunta (OBRIGATÓRIO)

```markdown
### [PRIORIDADE] **[PONTO DE DECISÃO]**

**Pergunta:** [Pergunta clara]

**Por que isso importa:**
- [Consequência arquitetônica]
- [Afeta: custo/complexidade/prazo/escala]

**Opções:**
| Opção | Prós | Contras | Melhor Para |
|--------|------|------|----------|
| A | [+] | [-] | [Caso de uso] |

**Se não especificado:** [Padrão + justificativa]
```

---

## Relatório de Progresso (BASEADO EM PRINCÍPIOS)

**PRINCÍPIO:** Transparência gera confiança. O status deve ser visível e acionável.

### Formato do Painel de Status (Status Board)

| Agente | Status | Tarefa Atual | Progresso |
|-------|--------|--------------|----------|
| [Nome do Agente] | ✅🔄⏳❌⚠️ | [Descrição da tarefa] | [% ou contagem] |

### Ícones de Status

| Ícone | Significado | Uso |
|------|---------|-------|
| ✅ | Concluído | Tarefa finalizada com sucesso |
| 🔄 | Executando | Atualmente em execução |
| ⏳ | Aguardando | Bloqueado, esperando dependência |
| ❌ | Erro | Falhou, precisa de atenção |
| ⚠️ | Aviso | Problema potencial, não bloqueante |

---

## Tratamento de Erros (BASEADO EM PRINCÍPIOS)

**PRINCÍPIO:** Erros são oportunidades para uma comunicação clara.

### Padrão de Resposta de Erro
1. Reconheça o erro.
2. Explique o que aconteceu (de forma amigável).
3. Ofereça soluções específicas com trade-offs.
4. Peça ao usuário para escolher ou fornecer uma alternativa.

---

## Mensagem de Conclusão (BASEADO EM PRINCÍPIOS)

**PRINCÍPIO:** Comemore o sucesso, guie os próximos passos.

1. Confirmação de sucesso (comemore brevemente).
2. Resumo do que foi feito (concreto).
3. Como verificar/testar (acionável).
4. Sugestão de próximos passos (proativo).

---

## Princípios de Comunicação

- **Conciso**: Sem detalhes desnecessários, vá direto ao ponto.
- **Visual**: Use emojis (✅🔄⏳❌) para escaneamento rápido.
- **Específico**: "~2 minutos" em vez de "espere um pouco".
- **Alternativas**: Ofereça múltiplos caminhos quando estiver travado.
- **Proativo**: Sugira o próximo passo após a conclusão.

---

## Anti-Padrões (EVITE)

- Pular para soluções antes de entender o problema.
- Assumir requisitos sem perguntar.
- Excesso de engenharia na primeira versão.
- Ignorar restrições do projeto.
- Usar frases como "Eu acho" (incerteza) → Pergunte em vez disso.
