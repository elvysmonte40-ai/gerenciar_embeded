---
name: testing-patterns
description: Padrões e princípios de teste. Estratégias de teste unitário, integração e mocking.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Padrões de Teste (Testing Patterns)

> Princípios para suítes de teste confiáveis.

---

## 1. Pirâmide de Testes

```
        /\          E2E (Poucos)
       /  \         Fluxos críticos
      /----\
     /      \       Integração (Alguns)
    /--------\      API, Queries de BD
   /          \
  /------------\    Unitários (Muitos)
                    Funções, classes
```

---

## 2. Padrão AAA

| Etapa | Propósito |
|------|---------|
| **Arrange** (Organizar) | Configurar dados de teste |
| **Act** (Agir) | Executar o código sob teste |
| **Assert** (Afirmar) | Verificar o resultado |

---

## 3. Seleção do Tipo de Teste

| Tipo | Melhor Para | Velocidade |
|------|----------|-------|
| **Unitário** | Funções puras, lógica | Rápido (<50ms) |
| **Integração** | API, BD, serviços | Média |
| **E2E** | Fluxos críticos de usuário | Lenta |

---

## 4. Princípios de Teste Unitário

| Princípio | Significado |
|-----------|---------|
| Rápido | < 100ms cada |
| Isolado | Sem dependências externas |
| Repetível | Mesmo resultado sempre |
| Auto-verificável | Sem verificação manual |
| Oportuno | Escrito junto com o código |

---

## 5. Princípios de Teste de Integração

- **O que testar**: Endpoints de API (request/response), Banco de Dados (queries, transações) e Serviços Externos (contratos).
- **Setup/Teardown**: Conectar recursos (`Before All`), resetar estado (`Before Each`), limpar (`After Each`) e desconectar (`After All`).

---

## 6. Princípios de Mocking

- **O que mocar**: APIs externas, Banco de Dados (em testes unitários), Tempo/Aleatoriedade e Rede.
- **Não mocar**: O código sob teste, dependências simples e funções puras.
- **Tipos de Mock**: Stub (valores fixos), Spy (rastrear chamadas), Mock (definir expectativas) e Fake (implementação simplificada).

---

## 7. Organização dos Testes

- **Nomenclatura**: "deve [comportamento] quando [condição]" (ex: "deve retornar erro quando usuário não for encontrado").
- **Agrupamento**: Use `describe` para agrupar testes relacionados e `it`/`test` para casos individuais.

---

## 8. Dados de Teste

- **Estratégias**: Fábricas (Factories), Fixtures (datasets predefinidos) e Builders.
- **Princípios**: Use dados realistas, randomize valores não primordiais (faker) e compartilhe fixtures comuns.

---

## 9. Melhores Práticas

- Uma afirmação (assert) por teste.
- Testes independentes (sem dependência de ordem).
- Nomes descritivos e auto-documentados.
- Limpeza para evitar efeitos colaterais.

---

## 10. Anti-Padrões (NÃO FAÇA)

- Testar implementação em vez de comportamento.
- Duplicar código de teste (use factories).
- Setup de teste complexo (simplifique ou divida).
- Ignorar testes instáveis (flaky tests).

---

> **Lembre-se:** Testes são documentação. Se alguém não consegue entender o que o código faz através dos testes, reescreva-os.
