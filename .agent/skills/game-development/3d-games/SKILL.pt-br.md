---
name: 3d-games
description: Princípios de desenvolvimento de jogos 3D. Renderização, shaders, física, câmeras.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Desenvolvimento de Jogos 3D (3D Game Development)

> Princípios para sistemas de jogos 3D.

---

## 1. Pipeline de Renderização e Otimização

- **Estágios**: Processamento de Vértices → Rasterização → Processamento de Fragmentos → Saída.
- **Otimização**: Use Culling (Frustum/Occlusion) para não renderizar o que não é visto e LOD (Level of Detail) para reduzir o detalhe conforme a distância. Faça batching de chamadas de desenho sempre que possível.

---

## 2. Shaders e Materiais

- **Vertex Shaders**: Cuidam da posição e normais.
- **Fragment Shaders**: Cuidam da cor e iluminação.
- **Quando customizar**: Para efeitos especiais (água, fogo), renderização estilizada (toon shader) ou otimização de performance.

---

## 3. Física e Câmera 3D

- **Física**: Use formas simples (Box, Sphere, Capsule) para colisão e reserve o Mesh Collider (caro) apenas para o terreno. Lembre-se: visuais complexos, colidores simples.
- **Câmera**: Escolha entre Terceira Pessoa, Primeira Pessoa, Isométrica ou Orbital. Implemente suavização (lerp), desvio de colisão e mudanças de FOV (campo de visão) para transmitir velocidade.

---

## 4. Iluminação e LOD

- **Luzes**: Direcional (Sol), Point (Lâmpadas) e Spot (Lanternas). Sombras em tempo real são caras; use luzes *baked* (pré-calculadas) sempre que possível.
- **LOD**: Reduza a contagem de triângulos progressivamente (Ex: 100% perto, 50% médio, 25% longe ou billboard).

---

## 5. Anti-Padrões (NÃO FAÇA)

- Usar Mesh Colliders em tudo (pesado).
- Sombras em tempo real no mobile (use sombras estáticas ou blob shadows).
- Ignorar o LOD para objetos distantes.
- Shaders não otimizados sem profiling.

---

> **Lembre-se:** 3D é sobre a ilusão. Crie a impressão de detalhe, não o detalhe em si.
