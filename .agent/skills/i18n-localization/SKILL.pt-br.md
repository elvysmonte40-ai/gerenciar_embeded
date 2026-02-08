---
name: i18n-localization
description: Padrões de internacionalização e localização. Detecção de strings hardcoded, gerenciamento de traduções, arquivos de localidade (locale) e suporte a RTL.
allowed-tools: Read, Glob, Grep
---

# i18n & Localização (i18n & Localization)

> Melhores práticas de Internacionalização (i18n) e Localização (L10n).

---

## 1. Conceitos Fundamentais

- **i18n**: Internacionalização - tornar o app traduzível.
- **L10n**: Localização - as traduções reais.
- **Locale**: Idioma + Região (ex: pt-BR, en-US).
- **RTL**: Idiomas da direita para a esquerda (ex: Árabe).

---

## 2. Padrões de Implementação e Estrutura

Use bibliotecas como `react-i18next` para React, `next-intl` para Next.js ou `gettext` para Python. Organize as traduções em arquivos JSON dentro de pastas por localidade (`locales/pt/common.json`, `locales/en/common.json`, etc.). Sempre use chaves de tradução em vez de texto bruto!

---

## 3. Melhores Práticas

### ✅ SIM (DO)
- Use chaves de tradução estruturadas por funcionalidade.
- Suporte pluralização e trate formatos de data/número por localidade (use a API `Intl`).
- Planeje para RTL desde o início.
- Use o formato de mensagem ICU para strings complexas.

### ❌ NÃO (DON'T)
- Strings hardcoded nos componentes.
- Concatenar strings traduzidas (quebra o gramatical de outros idiomas).
- Assumir o comprimento do texto (Português/Alemão podem ser 30-50% mais longos que Inglês).
- Misturar idiomas no mesmo arquivo de tradução.

---

## 4. Suporte a RTL (Right-to-Left)

Ao suportar idiomas como Árabe, use propriedades lógicas do CSS (`margin-inline-start` em vez de `margin-left`) para que o layout se adapte automaticamente à direção do texto.

---

## 5. Checklist de Entrega

- [ ] Todas as strings visíveis ao usuário usam chaves de tradução.
- [ ] Arquivos de locale existem para todos os idiomas suportados.
- [ ] Formatação de data/número usa a API `Intl`.
- [ ] Idioma de fallback (reserva) configurado.
- [ ] Nenhuma string hardcoded nos componentes.

---

> **Lembre-se:** i18n não é apenas traduzir palavras, é adaptar a experiência cultural e funcional do usuário.
