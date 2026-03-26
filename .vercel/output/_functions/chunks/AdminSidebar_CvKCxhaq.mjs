import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { m as maybeRenderHead, r as renderTemplate } from './entrypoint_CyO4XxjQ.mjs';
import 'clsx';
import { r as renderScript } from './AppLayout_9RuWQQJO.mjs';

const $$AdminSidebar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$AdminSidebar;
  return renderTemplate`${maybeRenderHead()}<div slot="sidebar" class="space-y-4"> <!-- Grupo Dashboard --> <div class="sidebar-group"> <button class="w-full flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-md py-1 group-toggle" aria-expanded="true"> <div class="px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
Dashboard
</div> <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-text-tertiary mr-2 transition-transform duration-200 chevron rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path> </svg> </button> <div class="space-y-1 ml-2 border-l border-gray-200 pl-2 overflow-hidden transition-all duration-300 ease-in-out group-content max-h-[500px] opacity-100"> <a href="/admin/dashboards" class="block px-3 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 rounded-md transition-colors">
Dashboards
</a> <a href="/admin/settings" class="block px-3 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 rounded-md transition-colors">
Power BI Embedded
</a> <a href="/admin/menus" class="block px-3 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 rounded-md transition-colors">
Menus
</a> </div> </div> <!-- Grupo Organização --> <div class="sidebar-group"> <button class="w-full flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-md py-1 group-toggle" aria-expanded="true"> <div class="px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
Organização
</div> <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-text-tertiary mr-2 transition-transform duration-200 chevron rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path> </svg> </button> <div class="space-y-1 ml-2 border-l border-gray-200 pl-2 overflow-hidden transition-all duration-300 ease-in-out group-content max-h-[500px] opacity-100"> <a href="/admin/departments" class="block px-3 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 rounded-md transition-colors">
Departamentos
</a> <a href="/admin/job-titles" class="block px-3 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 rounded-md transition-colors">
Cargos
</a> <a href="/admin/sectors" class="block px-3 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 rounded-md transition-colors">
Setores
</a> </div> </div> <!-- Grupo Geral --> <div class="sidebar-group"> <button class="w-full flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-md py-1 group-toggle" aria-expanded="true"> <div class="px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
Geral
</div> <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-text-tertiary mr-2 transition-transform duration-200 chevron rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path> </svg> </button> <div class="space-y-1 ml-2 border-l border-gray-200 pl-2 overflow-hidden transition-all duration-300 ease-in-out group-content max-h-[500px] opacity-100"> <a href="/admin/company" class="block px-3 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 rounded-md transition-colors">
Empresa
</a> <a href="/admin/perfis" class="block px-3 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 rounded-md transition-colors">
Perfis
</a> <a href="/admin/subscription" class="block px-3 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 rounded-md transition-colors">
Assinatura
</a> <a href="/admin/email-provider" class="block px-3 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 rounded-md transition-colors">
Provedor de Email
</a> <a href="/admin/settings/emails" class="block px-3 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 rounded-md transition-colors">
Logs de Email
</a> <a href="/admin/modules" class="block px-3 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 rounded-md transition-colors">
Módulos
</a> <a href="/admin/messages" class="block px-3 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 rounded-md transition-colors">
Mensagens do Sistema
</a> <a href="/admin/migration" class="block px-3 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 rounded-md transition-colors">
Migração
</a> <a href="/admin/audit-logs" class="block px-3 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 rounded-md transition-colors">
Auditoria (Logs)
</a> <a href="/admin/settings/voors" class="block px-3 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 rounded-md transition-colors">
Integração Voors
</a> </div> </div> </div> ${renderScript($$result, "D:/OneDrive/TatuTec/gerenciar/src/components/AdminSidebar.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/OneDrive/TatuTec/gerenciar/src/components/AdminSidebar.astro", void 0);

export { $$AdminSidebar as $ };
