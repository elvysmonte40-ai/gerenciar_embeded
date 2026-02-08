---
name: systematic-debugging
description: Metodologia de depuração sistemática em 4 fases com análise de causa raiz e verificação baseada em evidências. Use ao depurar problemas complexos.
allowed-tools: Read, Glob, Grep
---

# Depuração Sistemática (Systematic Debugging)

> Origem: obra/superpowers

## Visão Geral
Esta skill fornece uma abordagem estruturada para depuração que evita suposições aleatórias e garante que os problemas sejam devidamente compreendidos antes de serem resolvidos.

## Processo de Depuração em 4 Fases

### Fase 1: Reproduzir
Antes de corrigir, reproduza o problema de forma confiável.

```markdown
## Passos para Reprodução
1. [Passo exato para reproduzir]
2. [Próximo passo]
3. [Resultado esperado vs real]

## Taxa de Reprodução
- [ ] Sempre (100%)
- [ ] Frequentemente (50-90%)
- [ ] Às vezes (10-50%)
- [ ] Raro (<10%)
```

### Fase 2: Isolar
Estreite a busca pela origem.
- Quando isso começou a acontecer?
- O que mudou recentemente?
- Acontece em todos os ambientes?
- Podemos reproduzir com o mínimo de código?

### Fase 3: Compreender
Encontre a causa raiz, não apenas os sintomas.

```markdown
## Análise de Causa Raiz
### Os 5 Porquês
1. Por que: [Primeira observação]
2. Por que: [Motivo mais profundo]
3. Por que: [Ainda mais profundo]
4. Por que: [Chegando perto]
5. Por que: [Causa raiz]
```

### Fase 4: Corrigir e Verificar
Corrija e certifique-se de que foi realmente resolvido.
- [ ] O bug não reproduz mais.
- [ ] Funcionalidades relacionadas ainda funcionam.
- [ ] Nenhum novo problema foi introduzido.
- [ ] Teste adicionado para prevenir regressão.

---

## Checklist de Depuração

- [ ] Consigo reproduzir consistentemente.
- [ ] Verifiquei mudanças recentes (`git log`).
- [ ] Verifiquei logs em busca de erros.
- [ ] Adicionei logging se necessário.
- [ ] Usei debugger/breakpoints.
- [ ] Causa raiz documentada.
- [ ] Teste de regressão adicionado.

## Anti-Padrões a Evitar

❌ **Mudanças aleatórias** - "Talvez se eu mudar isso..."
❌ **Ignorar evidências** - "Isso não pode ser a causa"
❌ **Presumir** - "Deve ser X" sem provas
❌ **Corrigir às cegas** - Sem reproduzir primeiro
❌ **Parar nos sintomas** - Sem encontrar a causa raiz
