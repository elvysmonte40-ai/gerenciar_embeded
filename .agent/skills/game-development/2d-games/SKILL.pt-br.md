---
name: 2d-games
description: Princípios de desenvolvimento de jogos 2D. Sprites, tilemaps, física, câmera.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Desenvolvimento de Jogos 2D (2D Game Development)

> Princípios para sistemas de jogos 2D.

---

## 1. Sistemas de Sprites

- **Atlas**: Combine texturas para reduzir chamadas de desenho (draw calls).
- **Animação**: Siga princípios de squash & stretch, antecipação e acompanhamento (follow-through).
- **Camadas**: Controle a ordem Z para profundidade visual.

---

## 2. Design de Tilemaps

- **Tamanhos**: Comumente 16x16, 32x32 ou 64x64.
- **Camadas**: Organize entre Fundo (cenário), Terreno (chão), Props (objetos interativos) e Primeiro Plano (overlay/parallax).
- **Auto-tiling**: Use para facilitar a criação de terrenos.

---

## 3. Física e Câmera 2D

- **Física**: Use formas de colisão simples (Box, Circle, Capsule, Polygon) e camadas para filtragem.
- **Câmera**: Escolha entre modelos de Seguir (Follow), Antecipação (Look-ahead) ou Baseado em Salas (Room-based). Use o *Screen Shake* (tremor de tela) com moderação e curta duração.

---

## 4. Padrões de Gênero (Platformer / Top-down)

- **Platformer**: Implemente *Coyote time* (tolerância após cair da beirada) e *Jump buffering*.
- **Top-down**: Considere movimentação em 8 direções e o uso ou não de rotação e auto-aim.

---

## 5. Anti-Padrões (NÃO FAÇA)

- Usar texturas separadas (não otimizadas). Use atlas.
- Formas de colisão excessivamente complexas.
- Câmera instável ou tremida demais.
- Tentar misturar física bruta com colisão pixel-perfect sem critério.

---

> **Lembre-se:** 2D é sobre clareza. Cada pixel deve se comunicar com o jogador.
