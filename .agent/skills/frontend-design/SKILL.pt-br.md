---
name: frontend-design
description: Design thinking e tomada de decisão para UI web. Use ao projetar componentes, layouts, esquemas de cores, tipografia ou criar interfaces estéticas. Ensina princípios, não valores fixos.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Sistema de Design Frontend (Frontend Design System)

> **Filosofia:** Cada pixel tem um propósito. Moderação é luxo. A psicologia do usuário guia as decisões.
> **Princípio Central:** PENSE, não decore. PERGUNTE, não presuma.

---

## 🎯 Regra de Leitura Seletiva (OBRIGATÓRIO)

**Leia os arquivos NECESSÁRIOS sempre, OPCIONAIS apenas quando necessário:**

- [ux-psychology.md](ux-psychology.md) 🔴 **OBRIGATÓRIO** - Leia sempre primeiro!
- [color-system.md](color-system.md) ⚪ Opcional - Decisões de cor/paleta.
- [typography-system.md](typography-system.md) ⚪ Opcional - Seleção/pareamento de fontes.
- [visual-effects.md](visual-effects.md) ⚪ Opcional - Glassmorphism, sombras, gradientes.
- [animation-guide.md](animation-guide.md) ⚪ Opcional - Se precisar de animação.

---

## 🔧 Scripts de Runtime

| Script | Propósito | Uso |
|--------|---------|-------|
| `scripts/ux_audit.py` | Auditoria de Psicologia UX & Acessibilidade | `python scripts/ux_audit.py <caminho_do_projeto>` |

---

## ⚠️ CRÍTICO: PERGUNTE ANTES DE PRESUMIR (OBRIGATÓRIO)

**Se a solicitação for aberta, NÃO use seus padrões favoritos por padrão.**

- **Cor não especificada?** Pergunte: "Qual paleta de cores você prefere? (azul/verde/laranja/neutro/outra?)"
- **Estilo não especificado?** Pergunte: "Qual estilo você deseja? (minimalista/ousado/retrô/futurista/orgânico?)"
- **Layout não especificado?** Pergunte: "Tem preferência de layout? (coluna única/grid/assimétrico/largura total?)"

### ⛔ TENDÊNCIAS A EVITAR (ANTI-SAFA HARBOR):
- **Grids Bento**: Usado em quase todo design de IA. Pense se o conteúdo REALMENTE precisa disso.
- **Hero Split (Esquerda/Direita)**: Previsível e chato. Que tal tipografia massiva?
- **Glassmorphism**: A ideia da IA de "premium". Tente alto contraste e cores sólidas.
- **Ciano Profundo / Azul Fintech**: O refúgio seguro do banimento do roxo. Tente Vermelho, Preto ou Verde Neon.
- **Linguagem de IA**: "Orquestrar / Potencializar". Como um humano diria isso?

> 🔴 **"Cada estrutura 'segura' que você escolhe o deixa um passo mais perto de um template genérico. ARRISQUE."**

---

## 1. Princípios de Psicologia UX

- **Lei de Hick**: Muitas escolhas = decisões lentas. Limite opções.
- **Lei de Fitts**: Maior + mais perto = mais fácil de clicar.
- **Lei de Miller**: ~7 itens na memória de trabalho. Agrupe o conteúdo.
- **Von Restorff**: O diferente é memorável. Destaque CTAs visualmente.

---

## 2. Princípios de Layout

- **Proporção Áurea (φ = 1.618)**: Use para harmonia proporcional em conteúdo, tipografia e espaçamento.
- **Grade de 8 Pontos (8-Point Grid)**: Todo espaçamento e dimensionamento deve ser múltiplo de 8 (8px, 16px, 24px, etc.).
- **Tamanho de Toque**: Garanta alvos mínimos confortáveis para dispositivos móveis.
- **Largura de Leitura**: De 45-75 caracteres é o ideal para legibilidade.

---

## 3. Princípios de Cores e Tipografia

- **Regra 60-30-10**: 60% Cor Primária/Fundo, 30% Secundária, 10% Sotaque (CTAs).
- **Psicologia das Cores**: Azul para confiança/calma, Verde para crescimento/natureza, Laranja/Vermelho para energia/urgência.
- **Escala Tipográfica**: Use proporções consistentes (como 1.25 para web geral) e garanta contraste suficiente (WCAG).

---

## 4. Efeitos Visuais e Animação

- **Sombras**: Use hierarquia de elevação (elementos mais altos = sombras maiores).
- **Animação**: Foque no tempo e na suavidade (easing). Use `Ease-out` para entrar e `Ease-in` para sair. Performance: anime apenas `transform` e `opacity`.

---

## 5. Checklist "Fator Wow"

- [ ] Espaço em branco generoso (luxo = espaço para respirar).
- [ ] Profundidade e dimensão sutis.
- [ ] Animações suaves e propositais.
- [ ] Atenção aos detalhes (alinhamento, consistência).
- [ ] Elementos customizados (evite tudo padrão).

---

## 6. Anti-Padrões (O que NÃO fazer)

- Cores iguais em todos os projetos.
- Fundo escuro + brilho neon por padrão.
- **Tudo roxo/violeta (PROIBIDO - PURPLE BAN ✅)**.
- Clones de Vercel/SaaS modernos sem critério.

---

> **Lembre-se:** Design é PENSAR, não copiar. Todo projeto merece consideração fresca baseada em seu contexto único e seus usuários.
