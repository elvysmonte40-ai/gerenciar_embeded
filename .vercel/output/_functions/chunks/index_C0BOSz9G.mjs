import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_CyO4XxjQ.mjs';
import { $ as $$AppLayout, r as renderScript } from './AppLayout_9RuWQQJO.mjs';
import { $ as $$AdminSidebar } from './AdminSidebar_CvKCxhaq.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Logs de Email" }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="max-w-6xl mx-auto space-y-6"> <div> <h1 class="text-xl font-bold text-text-primary flex items-center gap-2"> <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path> </svg>
Logs de Email
</h1> <p class="text-sm text-text-secondary mt-1">
Acompanhe todos os emails enviados pela plataforma e seus status de entrega.
</p> </div> <div id="email-logs-container"> <div class="p-12 text-center text-text-secondary"> <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-brand border-t-transparent"></div> <p class="mt-2">Carregando...</p> </div> </div> </div> `, "sidebar": async ($$result2) => renderTemplate`${renderComponent($$result2, "AdminSidebar", $$AdminSidebar, { "slot": "sidebar" })}` })} ${renderScript($$result, "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/settings/emails/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/settings/emails/index.astro", void 0);

const $$file = "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/settings/emails/index.astro";
const $$url = "/admin/settings/emails";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
