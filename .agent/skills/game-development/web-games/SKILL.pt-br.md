---
name: web-games
description: Princípios de desenvolvimento de jogos em navegadores web. Seleção de frameworks, WebGPU, otimização e PWA.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Desenvolvimento de Jogos para Navegador (Web Browser Game Development)

> Seleção de frameworks e princípios específicos para web.

---

## 1. Seleção de Frameworks (2025)

- **Phaser 4**: Ideal para jogos 2D com recursos completos de engine.
- **PixiJS 8**: Focado em renderização 2D de alta performance e UI.
- **Three.js**: O padrão para visualizações 3D leves no navegador.
- **Babylon.js 7**: Engine 3D completa com suporte robusto para física e XR.

---

## 2. Adoção de WebGPU e Performance

- **WebGPU**: Use WebGPU para novos projetos (suporte em ~73% global), mantendo o WebGL como fallback. Verifique via `navigator.gpu`.
- **Otimização**: Priorize compressão de assets (KTX2, WebP), lazy loading (carregamento sob demanda), object pooling para evitar GC e Web Workers para cálculos pesados fora da thread principal.

---

## 3. Estratégia de Assets e PWA

- **Formatos**: Use KTX2 para texturas, WebM/Opus para áudio e glTF (com Draco) para modelos 3D.
- **PWA (Progressive Web App)**: Implemente para permitir jogo offline, instalação na tela inicial e modo tela cheia. Requer Service Worker e HTTPS.
- **Áudio**: Lembre-se que o contexto de áudio do navegador exige interação do usuário (clique/toque) para iniciar.

---

## 4. Anti-Padrões (NÃO FAÇA)

- Carregar todos os assets de uma vez no início (use carregamento progressivo).
- Ignorar a visibilidade da aba (pause o jogo quando a aba estiver oculta).
- Bloquear o jogo esperando o carregamento de áudios.
- Assumir que o jogador terá uma conexão rápida; planeje para redes lentas.

---

> **Lembre-se:** O navegador é a plataforma mais acessível. Respeite suas restrições e otimize para a web.
