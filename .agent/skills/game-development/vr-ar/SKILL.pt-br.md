---
name: vr-ar
description: Princípios de desenvolvimento de VR/AR. Conforto, interação e requisitos de performance.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Desenvolvimento de VR/AR (VR/AR Development)

> Princípios para experiências imersivas.

---

## 1. Princípios de Conforto (Prevenção de Enjoo)

O conforto não é opcional; jogadores com mal-estar não jogam.
- **Locomoção**: Priorize Teleporte e Snap turn (giro em etapas).
- **Mantenha o FPS alto**: Mínimo de 90 FPS constante. Quedas de frame geram vibrações visíveis e desconforto.
- **Câmera**: Evite tremores de câmera e acelerações rápidas que não sejam controladas pelo jogador.
- **Configurações**: Ofereça vinhetas durante o movimento e calibração de altura.

---

## 2. Requisitos de Performance e Escala Espacial

- **Orçamento de Frame**: 90 FPS = 11.11ms. Seja rigoroso com a performance.
- **Escala do Mundo**: Seguir a regra de **1 unidade = 1 metro** é crítico para que os objetos pareçam ter o tamanho correto.
- **Dicas de Profundidade**: Sombras e oclusão são essenciais para "aterrar" os objetos no mundo virtual.

---

## 3. Princípios de Interação

- **Controladores**: Use Point + Click para UI e Grab para manipulação.
- **Rastreamento de Mãos (Hand Tracking)**: Mais imersivo, porém menos preciso. Excelente para social e casual, desafiador para precisão.
- **UI**: Use textos grandes e legíveis; evite textos pequenos que cansam a vista em VR.

---

## 4. Anti-Padrões (NÃO FAÇA)

- Mover a câmera sem o comando do jogador.
- Deixar o FPS cair abaixo de 90.
- Usar textos de interface minúsculos.
- Ignorar o comprimento do braço do jogador ao posicionar elementos interativos.

---

> **Lembre-se:** Conforto é prioridade absoluta. Se o jogador sentir enjoo, a imersão falhou.
