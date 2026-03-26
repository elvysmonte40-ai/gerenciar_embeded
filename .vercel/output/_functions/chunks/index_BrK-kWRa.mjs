import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_CyO4XxjQ.mjs';
import { $ as $$AppLayout } from './AppLayout_9RuWQQJO.mjs';
import { $ as $$AdminSidebar } from './AdminSidebar_CvKCxhaq.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Mensagens do Sistema" }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="space-y-6"> <div class="flex justify-between items-center"> <div> <h1 class="text-2xl font-semibold text-text-primary">
Mensagens do Sistema
</h1> <p class="mt-1 text-sm text-text-secondary">
Gerencie avisos, comunicados e notificações para os
                    usuários.
</p> </div> <a href="/admin/messages/new" class="inline-flex items-center justify-center rounded-md border border-transparent bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 transition-colors"> <svg xmlns="http://www.w3.org/2000/svg" class="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path> </svg>
Nova Mensagem
</a> </div> <!-- Messages List Component (Client Side) --> ${renderComponent($$result2, "SystemMessageList", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/components/SystemMessageList", "client:component-export": "SystemMessageList" })} </div> `, "sidebar": ($$result2) => renderTemplate`${renderComponent($$result2, "AdminSidebar", $$AdminSidebar, { "slot": "sidebar" })}` })}`;
}, "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/messages/index.astro", void 0);

const $$file = "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/messages/index.astro";
const $$url = "/admin/messages";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
