---
name: game-art
description: Princípios de arte para jogos. Seleção de estilo visual, pipeline de assets, fluxo de trabalho de animação.
allowed-tools: Read, Glob, Grep
---

# Princípios de Arte para Jogos (Game Art Principles)

> Design visual para jogos - estilos, pipelines de assets e direção de arte.

---

## 1. Seleção de Estilo Visual

- **Nostálgico/Retrô**: Pixel Art ou estilo Vetorial/Flash.
- **Realista/Imersivo**: PBR 3D (para alto orçamento) ou texturas pintadas à mão.
- **Acessível/Casual**: Flat/Minimalista ou Soft shadows (sombras suaves).
- **Único/Experimental**: Defina um guia de estilo customizado.

---

## 2. Pipeline de Assets (2D e 3D)

O fluxo geralmente segue: **Conceito → Criação → Otimização (Atlas/Retopologia) → Rigging/Animação → Integração na Engine**. Use ferramentas como Aseprite/Photoshop para 2D e Blender/Maya para 3D. Sempre exporte em formatos prontos para a engine (FBX, glTF, Spritesheets).

---

## 3. Teoria das Cores e Animação

- **Cores**: Use paletas harmônicas para natureza, alto contraste para ação e temperaturas específicas para clima (horror vs cozy). A legibilidade do valor é mais importante que o matiz (hue).
- **Animação**: Siga os 12 princípios clássicos (Disney), como Squash & Stretch e Antecipação. No jogo, garanta silhuetas claras e tempo (timing) que comunique peso e velocidade.

---

## 4. Resolução, Escala e Organização

- **Unidade Base**: Mantenha a consistência (ex: 1 unidade = 1 metro em 3D). Em Pixel Art, trabalhe em 1x e dimensione para cima.
- **Nomenclatura**: Use o padrão `[tipo]_[objeto]_[variante].[ext]` (ex: `spr_player_idle.png`).
- **Organização**: Estruture pastas por categoria (personagens, ambiente, UI, efeitos).

---

## 5. Anti-Padrões (NÃO FAÇA)

- Misturar estilos artísticos sem critério.
- Ignorar a legibilidade da silhueta à distância de gameplay.
- Excesso de detalhes no fundo que distraem do jogador.
- Pular testes de cores na tela de destino.

---

> **Lembre-se:** A arte serve ao gameplay. Se não ajuda o jogador, é apenas decoração.
