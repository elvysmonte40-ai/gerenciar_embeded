import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { m as maybeRenderHead, h as addAttribute, r as renderTemplate } from './entrypoint_CyO4XxjQ.mjs';
import 'clsx';

const $$UserSidebar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$UserSidebar;
  const { currentPath } = Astro2.props;
  const isActive = (path) => currentPath === path;
  return renderTemplate`${maybeRenderHead()}<div class="space-y-1 h-full flex flex-col"> <!-- Context Header --> <div class="px-3 mb-2"> <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
Módulo Usuários
</h2> </div> <!-- User Menu Items --> <a href="/users"${addAttribute(`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive("/users") ? "bg-white text-brand border border-gray-200 shadow-sm" : "text-text-secondary hover:bg-gray-100"}`, "class")}>
Colaboradores
</a> <a href="/organogram"${addAttribute(`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive("/organogram") ? "bg-white text-brand border border-gray-200 shadow-sm" : "text-text-secondary hover:bg-gray-100"}`, "class")}>
Organograma
</a> <a href="/users/movements"${addAttribute(`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive("/users/movements") ? "bg-white text-brand border border-gray-200 shadow-sm" : "text-text-secondary hover:bg-gray-100"}`, "class")}>
Movimentações
</a> <!-- Footer Action removido conforme migração para /admin/settings --> </div>`;
}, "D:/OneDrive/TatuTec/gerenciar/src/modules/users/components/UserSidebar.astro", void 0);

export { $$UserSidebar as $ };
