---
name: game-development
description: Orquestrador de desenvolvimento de jogos. Roteia para skills específicas de plataforma com base nas necessidades do projeto.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Desenvolvimento de Jogos (Game Development)

> **Skill Orquestradora** que fornece princípios fundamentais e roteia para sub-skills especializadas.

---

## Roteamento de Sub-Skills

- **Web (HTML5, WebGL)**: `game-development/web-games`.
- **Mobile (iOS, Android)**: `game-development/mobile-games`.
- **PC (Desktop)**: `game-development/pc-games`.
- **2D / 3D**: `game-development/2d-games` ou `game-development/3d-games`.
- **Áreas Específicas**: `game-design`, `multiplayer`, `game-art`, `game-audio`.

---

## Princípios Fundamentais (Todas as Plataformas)

### 1. O Ciclo do Jogo (Game Loop)
Todo jogo segue este padrão: **ENTRADA (INPUT) → ATUALIZAÇÃO (UPDATE) → RENDERIZAÇÃO (RENDER)**.
- **Regra de Timestep Fixo**: A física/lógica deve rodar em uma taxa fixa (ex: 50Hz); a renderização o mais rápido possível.

### 2. Matriz de Seleção de Padrões
- **State Machine**: Para 3 a 5 estados discretos (Ex: Idle→Walk→Jump).
- **Object Pooling**: Para spawn/destruição frequente (Balas, partículas).
- **Observer/Events**: Comunicação entre sistemas (ex: Vida → UI).
- **ECS**: Apenas quando houver milhares de entidades similares e demanda de performance.

### 3. Abstração de Entrada e Performance
- Abstraia entradas em **AÇÕES** (ex: "pular"), não teclas brutas, para permitir rebind e multi-plataforma.
- **Orçamento de Performance**: 60 FPS = 16.67ms. Priorize otimizações de algoritmos, batching e pooling.

---

## Estratégias de IA e Colisão
- **IA**: Use Máquinas de Estado (FSM) para o simples, Árvores de Comportamento (Behavior Tree) para modularidade e planejadores (GOAP) para o complexo.
- **Colisão**: AABB para retângulos, Círculos para o que é redondo, e Quadtrees para mundos grandes.

---

## Anti-Padrões (NÃO FAÇA)

- Atualizar tudo em cada quadro (frame). Use eventos ou flags.
- Criar objetos em loops críticos (hot loops). Use pooling.
- Otimizar sem realizar profiling (medir primeiro).
- Misturar lógica com entrada bruta.

---

> **Lembre-se:** Grandes jogos vêm da iteração, não da perfeição. Prototipe rápido, depois refine.
