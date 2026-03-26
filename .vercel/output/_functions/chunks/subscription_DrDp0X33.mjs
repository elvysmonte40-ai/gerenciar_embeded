import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_CyO4XxjQ.mjs';
import { $ as $$AppLayout } from './AppLayout_9RuWQQJO.mjs';
import { $ as $$AdminSidebar } from './AdminSidebar_CvKCxhaq.mjs';

const $$Subscription = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Assinatura" }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8"> <div class="px-4 py-6 sm:px-0"></div> </div> `, "sidebar": ($$result2) => renderTemplate`${renderComponent($$result2, "AdminSidebar", $$AdminSidebar, { "slot": "sidebar" })}` })}`;
}, "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/subscription.astro", void 0);

const $$file = "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/subscription.astro";
const $$url = "/admin/subscription";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Subscription,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
