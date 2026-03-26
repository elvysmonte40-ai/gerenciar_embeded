import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_CyO4XxjQ.mjs';
import { $ as $$AppLayout } from './AppLayout_9RuWQQJO.mjs';
import { $ as $$AdminSidebar } from './AdminSidebar_CvKCxhaq.mjs';

const $$id = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  const isNew = id === "new";
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": isNew ? "Nova Mensagem" : "Editar Mensagem" }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="max-w-4xl mx-auto space-y-6"> <div class="flex items-center gap-4 mb-6"> <a href="/admin/messages" class="inline-flex items-center text-sm text-text-secondary hover:text-brand"> <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"></path> </svg>
Voltar
</a> <h1 class="text-2xl font-semibold text-text-primary"> ${isNew ? "Nova Mensagem" : "Editar Mensagem"} </h1> </div> <div class="bg-white shadow rounded-lg p-6"> ${renderComponent($$result2, "SystemMessageEditor", null, { "client:only": "react", "messageId": id, "client:component-hydration": "only", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/components/SystemMessageEditor", "client:component-export": "SystemMessageEditor" })} </div> </div> `, "sidebar": ($$result2) => renderTemplate`${renderComponent($$result2, "AdminSidebar", $$AdminSidebar, { "slot": "sidebar" })}` })}`;
}, "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/messages/[id].astro", void 0);

const $$file = "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/messages/[id].astro";
const $$url = "/admin/messages/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$id,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
