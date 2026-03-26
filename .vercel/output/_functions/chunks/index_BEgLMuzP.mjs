import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_CyO4XxjQ.mjs';
import { $ as $$AppLayout } from './AppLayout_9RuWQQJO.mjs';
import { $ as $$UserSidebar } from './UserSidebar_C3N1AAeC.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Gerenciamento de Usuários" }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="space-y-6"> ${renderComponent($$result2, "UserList", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/modules/users/components/UserList", "client:component-export": "default" })} </div> `, "sidebar": ($$result2) => renderTemplate`${renderComponent($$result2, "UserSidebar", $$UserSidebar, { "slot": "sidebar", "currentPath": "/users" })}` })}`;
}, "D:/OneDrive/TatuTec/gerenciar/src/pages/users/index.astro", void 0);

const $$file = "D:/OneDrive/TatuTec/gerenciar/src/pages/users/index.astro";
const $$url = "/users";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
