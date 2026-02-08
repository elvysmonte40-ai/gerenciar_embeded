---
name: webapp-testing
description: Princípios de teste de aplicações web. Estratégias de E2E (Ponta a Ponta), Playwright e auditoria profunda.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Teste de Aplicações Web (Web App Testing)

> Descubra e teste tudo. Não deixe nenhuma rota sem teste.

## 🔧 Scripts de Runtime

**Execute estes scripts para testes automatizados de navegador:**

| Script | Propósito | Uso |
|--------|---------|-------|
| `scripts/playwright_runner.py` | Teste básico de navegador | `python scripts/playwright_runner.py <URL>` |
| `a11y check` | Verificação de acessibilidade | `python scripts/playwright_runner.py <URL> --a11y` |

---

## 1. Abordagem de Auditoria Profunda

### Descoberta Primeiro
Mapeie o projeto antes de testar: examine as pastas `app/` ou `pages/` para encontrar rotas, use `grep` para encontrar endpoints de API e examine diretórios de componentes.

### Testagem Sistemática
1. **Mapear**: Liste todas as rotas e APIs.
2. **Escanear**: Verifique se elas respondem corretamente.
3. **Testar**: Cubra os caminhos críticos (critical paths).

---

## 2. Pirâmide de Testes para Web

```
        /\          E2E (Poucos)
       /  \         Fluxos críticos de usuário
      /----\
     /      \       Integração (Alguns)
    /--------\      API, fluxo de dados
   /          \
  /------------\    Componente (Muitos)
                    Peças individuais de UI
```

---

## 3. Princípios de Teste E2E

- **O que testar**: Caminhos felizes, fluxos de autenticação, ações críticas de negócio e tratamento de erros.
- **Melhores Práticas**: Use `data-testid` para seletores estáveis, espere pelos elementos (evite testes instáveis/flaky), garanta um estado limpo para testes independentes e foque no comportamento do usuário.

---

## 4. Princípios de Playwright

- Use o **Page Object Model (POM)** para encapsular a lógica da página.
- Utilize **Assertions** com auto-espera (auto-wait) embutida.
- Configure retentativas (retries) e traces (no primeiro erro) para auxiliar no debug.

---

## 5. Testes Visuais

Compare snapshots de design systems, páginas de marketing e bibliotecas de componentes para detectar mudanças visuais indesejadas (diffs visuais).

---

## 6. Princípios de Teste de API

Verifique códigos de status (200, 400, 500), conformidade do formato da resposta com o schema, mensagens de erro amigáveis e casos de borda.

---

## 7. Organização dos Testes

 Organize em pastas `tests/e2e`, `tests/integration` e `tests/component`. Adote convenções baseadas em funcionalidades (ex: `login.spec.ts`) ou descritivas (`user-can-checkout.spec.ts`).

---

## 8. Anti-Padrões (NÃO FAÇA)

- Testar detalhes de implementação técnica em vez de comportamento.
- Usar tempos de espera fixos (hardcoded wait) em vez de auto-wait.
- Pular a limpeza do estado entre testes.
- Ignorar testes instáveis (flaky tests).

---

> **Lembre-se:** Testes E2E são caros e demorados. Use-os apenas para os caminhos críticos da aplicação.
