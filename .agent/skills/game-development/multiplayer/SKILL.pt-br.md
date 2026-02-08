---
name: multiplayer
description: Princípios de desenvolvimento de jogos multiplayer. Arquitetura, rede (networking) e sincronização.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Desenvolvimento de Jogos Multiplayer (Multiplayer Game Development)

> Arquitetura de rede e princípios de sincronização.

---

## 1. Seleção de Arquitetura

- **Servidor Dedicado (Autoritativo)**: Melhor para competitivos em tempo real (Alta segurança, baixo lag, custo alto).
- **Baseado em Host (Host-based)**: Um jogador é o servidor; ideal para cooperativos casuais.
- **P2P (Peer-to-Peer)**: Custo baixo, mas segurança fraca e latência variável.

---

## 2. Princípios de Sincronização e Lag

- **Sincronização**: Escolha entre sincronizar o estado (State Sync) ou as entradas (Input Sync). A maioria dos jogos usa uma abordagem híbrida.
- **Compensação de Lag**:
    - **Predição (Prediction)**: O cliente prevê o servidor para resposta imediata.
    - **Interpolação (Interpolation)**: Suaviza a movimentação de outros jogadores.
    - **Reconciliação (Reconciliation)**: Corrige a posição do cliente se a predição falhar.
    - **Lag Compensation**: O servidor "volta no tempo" para validar hits.

---

## 3. Otimização de Rede e Segurança

- **Redução de Banda**: Use compressão delta (envie apenas mudanças), quantização (reduza a precisão) e Área de Interesse (envie apenas o que está perto do jogador).
- **Segurança**: **NUNCA CONFIE NO CLIENTE**. O servidor deve ser a autoridade absoluta; valide movimentos, hits e inventário para prevenir Speed hacks, Aimbots e duplicação de itens.

---

## 4. Anti-Padrões (NÃO FAÇA)

- Confiar nos dados vindos do cliente sem validação.
- Enviar todos os dados do mundo para todos os jogadores.
- Ignorar o lag; sempre projete pensando em latências de 100-200ms.
- Sincronizar posições exatas o tempo todo sem interpolação.

---

> **Lembre-se:** Nunca confie no cliente. O servidor é a única fonte da verdade.
