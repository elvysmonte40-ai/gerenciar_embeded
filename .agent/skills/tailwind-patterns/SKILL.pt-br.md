---
name: tailwind-patterns
description: Princípios do Tailwind CSS v4. Configuração baseada em CSS, container queries, padrões modernos, arquitetura de design tokens.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Padrões Tailwind CSS (v4 - 2025)

> CSS utilitário moderno com configuração nativa de CSS.

---

## 1. Arquitetura Tailwind v4

A v4 muda o jogo: a configuração sai do `tailwind.config.js` e vai para a diretiva `@theme` no CSS. O motor **Oxide** (em Rust) é 10x mais rápido e o modo JIT (Just-In-Time) agora é nativo e permanente.

---

## 2. Configuração Baseada em CSS

Defina seu tema diretamente no arquivo CSS:

```css
@theme {
  --color-primary: oklch(0.7 0.15 250);
  --spacing-md: 1rem;
  --font-sans: 'Inter', system-ui, sans-serif;
}
```

---

## 3. Container Queries (Nativo na v4)

Container Queries respondem à largura do elemento PAI, não da viewport.
- **Uso**: `@container` no pai e prefixos como `@sm:`, `@md:` nos filhos.
- **Quando usar**: Em componentes reutilizáveis que devem ser responsivos independentemente de onde forem colocados na página.

---

## 4. Design Responsivo Mobile-First

1. Escreva estilos mobile primeiro (sem prefixo).
2. Adicione overrides para telas maiores com prefixos (`sm:`, `md:`, `lg:`, `xl:`).
3. Exemplo: `w-full md:w-1/2 lg:w-1/3`.

---

## 5. Modo Escuro (Dark Mode)

Use o prefixo `dark:`.
- Fundo: `bg-white` → `dark:bg-zinc-900`.
- Texto: `text-zinc-900` → `dark:text-zinc-100`.

---

## 6. Padrões Modernos de Layout

- **Flexbox**: `flex items-center justify-center` para centralizar.
- **Grid**: Use `grid-cols-[repeat(auto-fit,minmax(250px,1fr))]` para grids responsivos automáticos.
- **Bento Grids**: Prefira layouts assimétricos em vez de grids simétricos simples de 3 colunas.

---

## 7. Tipografia e Cores

- Use o formato **OKLCH** para cores (mais uniforme perceptualmente).
- Organize cores em camadas: Primitivas (`--blue-500`), Semânticas (`--color-primary`) e de Componente (`--button-bg`).
- Use fontes modernas como 'Inter' ou 'Outfit'.

---

## 8. Anti-Padrões (NÃO FAÇA)

- Usar valores arbitrários em todo lugar (tente manter a escala do design system).
- Usar `!important` para resolver especificidade (ajuste o seletor ou a ordem).
- Duplicar listas longas de classes (extraia para componentes React/Vue ou use `@apply` com moderação).
- Misturar configurações da v3 com a v4.

---

> **Lembre-se:** Tailwind v4 é focado em CSS. Aproveite as variáveis CSS, container queries e recursos nativos. O arquivo de configuração JS agora é opcional.
