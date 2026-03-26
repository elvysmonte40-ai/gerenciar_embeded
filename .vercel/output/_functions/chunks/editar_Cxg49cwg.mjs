import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate } from './entrypoint_CyO4XxjQ.mjs';
import { $ as $$AppLayout } from './AppLayout_9RuWQQJO.mjs';
import { P as ProcessSidebar } from './ProcessSidebar_BMM-89on.mjs';

const $$Editar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Editar;
  const { id } = Astro2.params;
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Editor de Processo", "fullWidth": true, "rawSidebar": true }, { "default": ($$result2) => renderTemplate`  ${renderComponent($$result2, "ProcessEditor", null, { "client:only": "react", "processId": id, "client:component-hydration": "only", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/modules/processes/components/editor/ProcessEditor", "client:component-export": "ProcessEditor" })} `, "sidebar": ($$result2) => renderTemplate`${renderComponent($$result2, "ProcessSidebar", ProcessSidebar, { "client:load": true, "slot": "sidebar", "client:component-hydration": "load", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/modules/processes/components/shared/ProcessSidebar", "client:component-export": "ProcessSidebar" })}` })}`;
}, "D:/OneDrive/TatuTec/gerenciar/src/pages/processes/[id]/editar.astro", void 0);

const $$file = "D:/OneDrive/TatuTec/gerenciar/src/pages/processes/[id]/editar.astro";
const $$url = "/processes/[id]/editar";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Editar,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
