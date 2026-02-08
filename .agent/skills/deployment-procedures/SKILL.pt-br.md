---
name: deployment-procedures
description: Princípios de implantação em produção e tomada de decisão. Fluxos de trabalho de deply seguros, estratégias de rollback e verificação. Ensina a pensar, não apenas scripts.
allowed-tools: Read, Glob, Grep, Bash
---

# Procedimentos de Deploy (Deployment Procedures)

> Princípios para lançamentos seguros em produção.
> **Aprenda a PENSAR, não apenas a decorar scripts.**

---

## 1. Seleção de Plataforma e Preparação

Dependendo do seu projeto (Vercel, Railway, VPS, Docker, K8s), o método de deploy muda, mas os princípios de segurança são universais. Antes de começar, verifique a qualidade do código (testes/lint), o build de produção, as variáveis de ambiente e garanta que possui um backup e um plano de rollback.

---

## 2. O Processo de 5 Fases

1. **PREPARAR**: Verifique código, build e vars de ambiente.
2. **BACKUP**: Salve o estado atual ANTES de mudar qualquer coisa.
3. **DEPLOY**: Execute enquanto monitora ativamente.
4. **VERIFICAR**: Health check, logs e fluxos principais (key flows).
5. **CONFIRMAR ou REVERTER**: Tudo certo? Confirme. Problemas? Rollback.

---

## 3. Princípios de Rollback (Reversão)

- **Quando reverter**: Se o serviço cair, se houver erros críticos ou se a performance degradar mais de 50%.
- **Prioridade**: Rapidez sobre perfeição. Reverta primeiro, debuge depois.
- **Comunicação**: Informe a equipe sobre o que aconteceu.

---

## 4. Deploy com Tempo de Inatividade Zero (Zero-Downtime)

Considere estratégias como **Rolling** (substituição gradual), **Blue-Green** (troca de tráfego entre ambientes) ou **Canary** (liberação gradual para uma pequena parcela de usuários).

---

## 5. Procedimentos de Emergência

Se o serviço cair:
1. **Avalie** o sintoma.
2. **Correção rápida**: Reinicie se o motivo não estiver claro.
3. **Rollback**: Se reiniciar não ajudar.
4. **Investigue**: Ordem: Logs → Recursos → Rede → Dependências.

---

## 6. Anti-Padrões (NÃO FAÇA)

- Fazer deploy na sexta-feira à tarde.
- Pular o ambiente de staging.
- Fazer deploy sem backup.
- Abandonar o monitoramento logo após o deploy (espere pelo menos 15 min).
- Múltiplas mudanças grandes de uma só vez.

---

> **Lembre-se:** Cada deploy é um risco. Minimize o risco através da preparação, não da velocidade.
