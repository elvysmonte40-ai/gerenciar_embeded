---
name: pc-games
description: Princípios de desenvolvimento de jogos para PC e consoles. Seleção de engine, recursos de plataforma e estratégias de otimização.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Desenvolvimento de Jogos para PC/Console (PC/Console Game Development)

> Seleção de engine e princípios específicos de plataforma.

---

## 1. Seleção de Engine

- **Unity 6**: Excelente para 2D/3D multiplataforma e equipes de qualquer tamanho.
- **Godot 4**: A melhor escolha para 2D, código aberto e fluxos leves para desenvolvedores indie/solo.
- **Unreal 5**: O padrão para qualidade visual AAA, com tecnologias como Nanite e Lumen; requer maior curva de aprendizado (C++/Blueprints).

---

## 2. Recursos de Plataformas e Controles

- **Integração Steam**: Implemente Conquistas (Achievements), Saves na Nuvem, Leaderboards e Workshop.
- **Suporte a Controles**: Abstraia **AÇÕES**, não botões, para suportar diferentes layouts (Xbox, PlayStation, Nintendo). Use feedback háptico (vibração) para reforçar o impacto e feedback de UI.
- **Certificações**: Esteja ciente das exigências específicas de cada console (Sony, Microsoft, Nintendo) desde o início do projeto.

---

## 3. Otimização de Performance

- **Profiling (Medição)**: Use o Profiler da sua engine (Unity Profiler, Unreal Insights) para identificar gargalos.
- **Gargalos Comuns**: Reduza chamadas de desenho (Draw calls) com batching, evite picos de Coleta de Lixo (GC) com Object Pooling e simplifique a física sempre que possível.

---

## 4. Anti-Padrões (NÃO FAÇA)

- Escolher a engine apenas pelo hype sem avaliar as necessidades do projeto.
- Ignorar as diretrizes de certificação das plataformas até o final do desenvolvimento.
- Codificar botões específicos (hardcode) em vez de abstrair para ações.
- Pular a fase de profiling e tentar otimizar no "olhômetro".

---

> **Lembre-se:** A engine é apenas uma ferramenta. Domine os princípios e adapte-se a qualquer tecnologia.
