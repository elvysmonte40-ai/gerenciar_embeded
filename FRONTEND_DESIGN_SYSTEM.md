# Frontend Design System

> **Filosofia:** Leve, Fluido, Objetivo, Intuitivo e Moderno.
> **Inspiração:** Microsoft Fluent Design / Azure Portal.

---

## 1. Princípios de Navegação

A navegação deve ser hierárquica e contextual, separando o escopo global do escopo local.

### 1.1 Topbar (Cabeçalho) - Escopo Global
O cabeçalho é fixo e contém a navegação entre os grandes **Módulos** da plataforma.

*   **Localização:** Topo, altura fixa (ex: `h-14` ou `h-16`).
*   **Conteúdo:**
    *   **Esquerda:** Logo da Aplicação.
    *   **Centro:** Links para os Módulos (Tabs ou Links discretos).
        *   `Dashboards` (Power BI)
        *   `Gestão de Usuários`
        *   `Metas e Indicadores` (Futuro)
    *   **Direita:** Perfil do Usuário, Notificações, Configurações Globais (Organization Switcher).
*   **Estilo:** Fundo branco ou cinza muito claro (`bg-white` ou `bg-gray-50`), borda inferior sutil. Sombra suave apenas ao rolar a página.

### 1.2 Sidebar (Barra Lateral) - Escopo Local
A barra lateral é contextual e muda de acordo com o Módulo selecionado no Cabeçalho.

*   **Localização:** Esquerda, fixa, altura total (`h-[calc(100vh-theme(spacing.14))]`).
*   **Conteúdo:** Navegação interna do módulo ativo.
    *   *Exemplo (Módulo Dashboards):* "Vendas", "Financeiro", "Operacional".
    *   *Exemplo (Módulo Usuários):* "Todos", "Convites", "Grupos", "Permissões".
*   **Comportamento:** Colapsável em telas menores ou mobile.
*   **Estilo:** Cinza claro (`bg-gray-50/50`) ou branco com borda à direita.

### 1.3 Área de Conteúdo (Main)
*   **Layout:** Preenche o restante da tela.
*   **Padding:** Generoso (`p-6` ou `p-8`) para sensação de "respiro" (whitespace).
*   **Container:** Centralizado se o conteúdo for texto/formulário; Largura total (`w-full`) para Dashboards/Gráficos.

---

## 2. Sistema de Cores (Microsoft Fluent Inspired)

Paleta sóbria, focada em produtividade e confiança. Evita distração.

### 2.1 Paleta Primária (Brand Identity)
*   **Brand Blue:** `#0078D4` (Microsoft Blue) - Ações principais, botões primários, links ativos.
*   **Brand Dark:** `#106EBE` - Hover states.
*   **Brand Light:** `#DEECF9` - Fundos de seleção, hovers sutis em listas.

### 2.2 Neutros (Superfícies e Texto)
*   **Texto Principal:** `#201F1E` (Quase preto, melhor contraste que cinza).
*   **Texto Secundário:** `#605E5C` (Cinza médio, para labels e descrições).
*   **Bordas/Divisores:** `#E1DFDD` (Cinza neutro).
*   **Background App:** `#FAF9F8` (Off-white, evita o brilho excessivo do branco puro).
*   **Background Card:** `#FFFFFF` (Branco puro + sombra suave).

### 2.3 Semântica (Status)
*   **Sucesso:** `#107C10` (Verde Office).
*   **Erro:** `#A80000` (Vermelho escuro).
*   **Aviso:** `#D83B01` (Laranja avermelhado).
*   **Info:** `#0078D4` (Azul Brand).

---

## 3. Tipografia

Limpa, sem serifa, otimizada para leitura de dados.

*   **Família:** `Segoe UI` (Windows/System), `Inter`, `Roboto`, ou `San Francisco` (Mac). Preferir stack nativa do sistema (`font-sans`).
*   **Pesos:**
    *   **Regular (400):** Corpo do texto, dados em tabelas.
    *   **Semibold (600):** Títulos de cartões, cabeçalhos de tabela, botões.
    *   **Bold (700):** Apenas grandes títulos de página (H1).
*   **Tamanhos:**
    *   `text-sm` (14px): Padrão para interface densa (tabelas, listas).
    *   `text-base` (16px): Corpo de texto leitura corrida.
    *   `text-xl` (20px): Títulos de seções.

---

## 4. Componentes UI (Look & Feel)

### 4.1 Cards (Cartões)
*   **Estilo:** Fundo branco, borda sutil (`border-gray-200`), sombra suave (`shadow-sm`).
*   **Uso:** Agrupamento de informações, widgets de dashboard, listas de itens.
*   **Border Radius:** `rounded-lg` (8px) ou `rounded-xl` (12px) modern. Não usar cantos totalmente retos nem pílulas.

### 4.2 Botões
*   **Primário:** `bg-[#0078D4] text-white hover:bg-[#106EBE] rounded-md px-4 py-2 font-semibold shadow-sm`.
*   **Secundário/Outline:** `bg-white border boundary-gray-300 text-gray-700 hover:bg-gray-50 rounded-md px-4 py-2`.
*   **Ghost/Link:** `text-[#0078D4] hover:underline hover:bg-blue-50 px-2`.

### 4.3 Efeitos Visuais
*   **Glassmorphism:** Usar com EXTREMA moderação. Apenas em elementos flutuantes (ex: sticky header, modals) para dar profundidade. `backdrop-blur-md bg-white/80`.
*   **Sombras:** Usar sombras difusas e suaves para elevação (`shadow-md` do Tailwind). Evitar sombras duras e pretas.

---

## 5. Implementação Técnica (Astro + Tailwind v4)

### 5.1 Configuração Tailwind (`index.css`)
```css
@import "tailwindcss";

@theme {
  /* Colors */
  --color-brand: #0078D4;
  --color-brand-dark: #106EBE;
  --color-brand-light: #DEECF9;
  
  --color-surface: #FAF9F8;
  --color-surface-card: #FFFFFF;
  
  --color-text-primary: #201F1E;
  --color-text-secondary: #605E5C;

  /* Fonts */
  --font-sans: "Segoe UI", "Inter", system-ui, sans-serif;
  
  /* Radius */
  --radius-card: 0.75rem; /* 12px */
  --radius-btn: 0.375rem; /* 6px */
}

/* Base Styles */
body {
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}
```

### 5.2 Estrutura de Layout Astro
```astro
<!-- src/layouts/AppLayout.astro -->
<div class="flex h-screen flex-col bg-surface text-text-primary">
  <!-- 1. Header Global -->
  <header class="h-14 border-b border-gray-200 bg-white px-4 flex items-center justify-between">
    <!-- Logo & Global Nav -->
  </header>

  <div class="flex flex-1 overflow-hidden">
    <!-- 2. Sidebar Contextual -->
    <aside class="w-64 border-r border-gray-200 bg-gray-50/50 p-4 overflow-y-auto">
      <slot name="sidebar" />
    </aside>

    <!-- 3. Main Content -->
    <main class="flex-1 overflow-y-auto p-6">
      <slot />
    </main>
  </div>
</div>
```

---

## 6. Checklist de Qualidade Visual "Wow Factor"

*   [ ] **Whitespace:** Os elementos respiram? Evite amontoar dados. Use `gap-6` ou `gap-8`.
*   [ ] **Feedback:** Todo clique tem um estado visual (hover, active, focus)?
*   [ ] **Consistência:** Os títulos H1, botões e cards são idênticos em todas as telas?
*   [ ] **Alinhamento:** Tudo está alinhado ao grid (ex: margens de 24px/1.5rem)?
*   [ ] **Loading:** Use skeletons (`animate-pulse` cinza claro) em vez de spinners gigantes para carregamento de dados.
