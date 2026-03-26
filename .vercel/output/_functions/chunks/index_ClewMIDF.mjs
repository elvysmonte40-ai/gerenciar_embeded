import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_CyO4XxjQ.mjs';
import { $ as $$AppLayout, r as renderScript } from './AppLayout_9RuWQQJO.mjs';
import { $ as $$AdminSidebar } from './AdminSidebar_CvKCxhaq.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Integração Voors" }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="max-w-4xl mx-auto space-y-8"> <!-- Settings Header --> <div> <h1 class="text-2xl font-bold text-gray-900">Integração Voors</h1> <p class="mt-1 text-sm text-gray-500">
Configure as credenciais e o pareamento de campos para a
                sincronização de usuários da intranet Voors.
</p> </div> <!-- Credentials Form --> <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"> <div class="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center"> <div> <h2 class="text-base font-semibold text-gray-900 flex items-center gap-2"> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-brand"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
Credenciais da API (Por Empresa)
</h2> </div> </div> <form id="voors-settings-form" class="p-6 space-y-6"> <!-- Token --> <div> <label for="voors_token" class="block text-sm font-medium text-gray-700">Token de Autorização (Authorization Header)</label> <div class="relative mt-1"> <input type="password" name="voors_token" id="voors_token" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm px-3 py-2 border pr-10" placeholder="ex: e9b698f1-..." required> <button type="button" id="toggle-voors-token" class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"> <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path> </svg> </button> </div> <p class="mt-1 text-xs text-gray-500">
Este token é providenciado pelo suporte da plataforma
                        Voors para a sua empresa.
</p> </div> <!-- Auto Sync Toggle --> <div class="flex items-start"> <div class="flex h-5 items-center"> <input id="auto_sync_enabled" name="auto_sync_enabled" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"> </div> <div class="ml-3 text-sm"> <label for="auto_sync_enabled" class="font-medium text-gray-700">Sincronização Automática Noturna</label> <p class="text-gray-500">
Se ativado, o sistema importará e atualizará a base
                            todos os dias durante a madrugada.
</p> </div> </div> <div class="pt-4 flex items-center justify-between border-t border-gray-100"> <div class="text-sm text-gray-500" id="last-sync-status">
Última sincronização: <span class="font-medium text-gray-900" id="last-sync-date">Nunca</span> </div> <div class="flex gap-3 items-center"> <div id="form-feedback" class="text-sm font-medium hidden"></div> <button type="button" id="btn-sync-now" class="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 transition-colors disabled:opacity-50">
Sincronizar Base Agora
</button> <button type="submit" class="inline-flex justify-center rounded-md border border-transparent bg-brand py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 transition-colors disabled:opacity-50">
Salvar Configuração
</button> </div> </div> </form> </div> <!-- Histórico de Sincronizações --> <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6"> <div class="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center"> <div> <h2 class="text-base font-semibold text-gray-900 flex items-center gap-2"> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500"><path d="M3 3v18h18"></path><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path></svg>
Histórico de Sincronizações
</h2> <p class="text-xs text-gray-500 mt-1">
Acompanhe os resultados das últimas atualizações da base
                        do Voors.
</p> </div> </div> <div class="overflow-x-auto"> <table class="min-w-full divide-y divide-gray-200"> <thead class="bg-gray-50"> <tr> <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data / Hora</th> <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gatilho</th> <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuários Obtidos</th> <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criados / Atualizados</th> <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ativos / Inativos</th> </tr> </thead> <tbody class="bg-white divide-y divide-gray-200" id="history-table-body"> <tr> <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
Carregando histórico...
</td> </tr> </tbody> </table> </div> </div> </div> `, "sidebar": async ($$result2) => renderTemplate`${renderComponent($$result2, "AdminSidebar", $$AdminSidebar, { "slot": "sidebar" })}` })} ${renderScript($$result, "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/settings/voors/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/settings/voors/index.astro", void 0);

const $$file = "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/settings/voors/index.astro";
const $$url = "/admin/settings/voors";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
