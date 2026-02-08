---
name: server-management
description: Princípios de gerenciamento de servidores e tomada de decisão. Gerenciamento de processos, estratégia de monitoramento e decisões de escala. Ensina a pensar, não apenas comandos.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Gerenciamento de Servidores (Server Management)

> Princípios para operações em produção.
> **Aprenda a PENSAR, não apenas a decorar comandos.**

---

## 1. Princípios de Gerenciamento de Processos

- **Node.js**: Use PM2 (clustering, recarregamento automático).
- **Geral**: Use `systemd` (nativo do Linux) ou Containers (Docker).
- **Metas**: Garantir reinicialização após falhas, recarregamento sem tempo de inatividade (zero-downtime) e sobrevivência do processo após reinicialização do servidor.

---

## 2. Princípios de Monitoramento e Logs

- **O que monitorar**: Disponibilidade (uptime), Performance (tempo de resposta), Taxa de Erros e Recursos (CPU, memória, disco).
- **Estratégia de Logs**: Use logs estruturados (JSON) para facilitar a análise, implemente rotação de logs para não encher o disco e NUNCA armazene dados sensíveis em logs.

---

## 3. Decisões de Escala (Scaling)

- **Escalar por Sintoma**: Adicione instâncias (escala horizontal) se a CPU estiver alta; aumente a RAM (escala vertical) se a memória estiver esgotada.
- **Auto-scaling**: Ideal para picos de tráfego variáveis.

---

## 4. Princípios de Saúde (Health Check)

A saúde do serviço não é apenas um "HTTP 200"; verifique se o Banco de Dados está conectado e se os serviços externos (dependências) estão acessíveis. Escolha entre checagens simples ou profundas conforme a necessidade do seu balanceador de carga.

---

## 5. Princípios de Segurança

- Acesso apenas via chaves SSH (nada de senhas).
- Firewall configurado para abrir apenas as portas estritamente necessárias.
- Segredos armazenados em variáveis de ambiente, nunca em arquivos.
- Atualizações regulares de patches de segurança.

---

## 6. Prioridade de Solução de Problemas (Troubleshooting)

1. **Checar se está rodando** (status do processo).
2. **Checar logs** (mensagens de erro).
3. **Checar recursos** (disco, memória, CPU).
4. **Checar rede** (portas, DNS).
5. **Checar dependências** (banco de dados, APIs).

---

## 7. Anti-Padrões (NÃO FAÇA)

- Rodar processos como `root`.
- Ignorar logs ou pular a rotação de logs.
- Reinicializações manuais (use ferramentas de auto-restart).
- Operar sem backups regulares.

---

> **Lembre-se:** Um servidor bem gerenciado é um servidor que não gera surpresas. Esse é o objetivo.
