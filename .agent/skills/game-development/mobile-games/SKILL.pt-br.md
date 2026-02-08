---
name: mobile-games
description: Princípios de desenvolvimento de jogos mobile. Entrada por toque, bateria, performance em dispositivos móveis e lojas de aplicativos.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Desenvolvimento de Jogos Mobile (Mobile Game Development)

> Restrições de plataforma e princípios de otimização.

---

## 1. Considerações de Plataforma e Toque

- **Entrada por Toque**: Alvos mínimos de 44x44 pontos, feedback visual imediato e uso de gestos. O dedo do jogador pode ocultar parte da tela; planeje a UI de acordo.
- **Interrupções**: Garanta que o jogo pause automaticamente ao ser colocado em segundo plano.

---

## 2. Performance e Bateria

- **Gerenciamento Térmico**: Reduza a qualidade visual ou limite o FPS se o dispositivo aquecer.
- **Otimização de Bateria**: 30 FPS costuma ser suficiente para muitos jogos; use o modo escuro para economizar bateria em telas OLED e minimize o uso de GPS/Rede.

---

## 3. Requisitos das Lojas (App Store / Google Play)

- **iOS**: Labels de privacidade, opção de exclusão de conta e screenshots para todos os tamanhos de tela.
- **Android**: Alvo na API atual do SDK, suporte a 64 bits e uso de App Bundles.

---

## 4. Modelos de Monetização

Escolha entre **Premium** (pagamento único), **Free + IAP** (compras no app para progressão), **Anúncios** (para jogos hyper-casual) ou **Assinatura** (para atualizações constantes de conteúdo).

---

## 5. Anti-Padrões (NÃO FAÇA)

- Usar controles de desktop em telas mobile (adicione joysticks virtuais ou gestos).
- Ignorar o dreno de bateria e aquecimento do aparelho.
- Forçar o modo paisagem (landscape) se o jogo puder ser jogado em retrato (portrait).
- Exigir conexão de rede constante sem necessidade de sincronização real.

---

> **Lembre-se:** Mobile é a plataforma mais restrita. Respeite a bateria e a atenção do seu jogador.
