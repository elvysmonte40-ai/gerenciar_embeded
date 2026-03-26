import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_CyO4XxjQ.mjs';
import { $ as $$AppLayout } from './AppLayout_9RuWQQJO.mjs';
import { $ as $$UserSidebar } from './UserSidebar_C3N1AAeC.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Organograma - Gerenciar", "fullWidth": true }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="h-full flex flex-col p-6"> <div class="flex-1 flex flex-col overflow-hidden relative"> ${renderComponent($$result2, "Organogram", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/modules/users/components/Organogram", "client:component-export": "default" })} </div> </div> `, "sidebar": ($$result2) => renderTemplate`${renderComponent($$result2, "UserSidebar", $$UserSidebar, { "slot": "sidebar", "currentPath": Astro2.url.pathname })}` })}`;
}, "D:/OneDrive/TatuTec/gerenciar/src/pages/organogram/index.astro", void 0);

const $$file = "D:/OneDrive/TatuTec/gerenciar/src/pages/organogram/index.astro";
const $$url = "/organogram";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
