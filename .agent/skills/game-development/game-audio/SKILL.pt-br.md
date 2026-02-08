---
name: game-audio
description: Princípios de áudio para jogos. Sound design, integração de música e sistemas de áudio adaptativo.
allowed-tools: Read, Glob, Grep
---

# Princípios de Áudio para Jogos (Game Audio Principles)

> Sound design e integração de música para experiências imersivas.

---

## 1. Categorias e Hierarquia de Áudio

- **Música (Music)**: Loops, crossfades, ducking (fundo/combate).
- **SFX (Efeitos Sonoros)**: One-shots, posicionados em 3D (passos, impactos).
- **Ambiente (Ambient)**: Loops de fundo (vento, floresta).
- **UI (Interface)**: Sons imediatos, não 3D (cliques).
- **Voz (Voice)**: Categoria de maior prioridade (diálogos, narrador).

---

## 2. Decisões de Sound Design e Música

- **Criação de SFX**: Use camadas (Attack, Body, Tail, Sweetener) para sons complexos como tiros.
- **Música Adaptativa**: Use técnicas como **Crossfade** (transição suave), **Stinger** (evento imediato) ou **Stem mixing** (camadas de instrumentos que entram/saem conforme a intensidade do jogo).
- **Vertical vs Horizontal**: Adicione camadas para intensidade (Vertical) ou mude de seção musical para mudanças de estado (Horizontal).

---

## 3. Posicionamento 3D e Mixagem

- **Espacialização**: Sons de inimigos e tiros devem ser posicionados em 3D para dar consciência tática ao jogador. Música e UI são sons 2D (não posicionais).
- **Mixagem (Ducking)**: Reduza o volume da música e do ambiente quando houver voz (-6 a -9 dB) ou quando ocorrer uma explosão, para manter a clareza.
- **Anti-repetição**: Nunca toque o mesmo som repetidamente sem variações (use 3-5 variações de pitch e volume).

---

## 4. Considerações de Plataforma

- **PC**: OGG Vorbis, WAV.
- **Mobile**: MP3, AAC (foco em tamanho reduzido).
- **Web**: WebM/Opus ou MP3 como fallback.

---

## 5. Anti-Padrões (NÃO FAÇA)

- Colocar tudo no volume máximo.
- Ignorar o silêncio (o silêncio cria contraste).
- Deixar a mesma música em loop eterno sem transições.
- Pular o áudio no protótipo (o feedback sonoro é crucial para sentir o jogo).

---

> **Lembre-se:** 50% da experiência de um jogo é o áudio. Um jogo mudo perde metade da sua alma.
