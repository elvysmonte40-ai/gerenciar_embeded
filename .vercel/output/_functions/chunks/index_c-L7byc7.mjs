import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate } from './entrypoint_CyO4XxjQ.mjs';
import { $ as $$AppLayout } from './AppLayout_9RuWQQJO.mjs';
import { P as ProcessSidebar } from './ProcessSidebar_BMM-89on.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { s as supabase } from './supabase_C4p1dVZL.mjs';
import { FileText, Plus } from 'lucide-react';

const ProcessWelcome = () => {
  const [permissions, setPermissions] = useState(null);
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function loadPermissions() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const { fetchUserPermissions } = await import('./permissions_CCDHY6zh.mjs');
        const perms = await fetchUserPermissions(session.user.id);
        setPermissions(perms.permissions);
        setIsOrgAdmin(perms.isOrgAdmin);
      } catch (error) {
        console.error("Error loading permissions for welcome screen:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPermissions();
  }, []);
  if (loading) return null;
  const canCreate = isOrgAdmin || permissions?.processes?.create;
  return /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-white p-10 rounded-xl shadow-sm border border-gray-100 max-w-lg w-full", children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto flex flex-col items-center justify-center h-16 w-16 rounded-full bg-brand/10 mb-6", children: /* @__PURE__ */ jsx(FileText, { className: "h-8 w-8 text-brand" }) }),
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Processos" }),
    /* @__PURE__ */ jsx("p", { className: "text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed", children: "Selecione um processo no menu lateral para visualizar ou editar seus detalhes." }),
    canCreate ? /* @__PURE__ */ jsxs(
      "a",
      {
        href: "/processes/novo",
        className: "inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors w-full sm:w-auto",
        children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-5 w-5 mr-2" }),
          "Criar Novo Processo"
        ]
      }
    ) : /* @__PURE__ */ jsx("div", { className: "inline-flex items-center text-sm text-gray-400 bg-gray-50 px-4 py-2 rounded-md border border-gray-100", children: "Você não tem permissão para criar processos." })
  ] }) });
};

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Processos", "rawSidebar": true }, { "default": ($$result2) => renderTemplate`  ${renderComponent($$result2, "ProcessWelcome", ProcessWelcome, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/modules/processes/components/shared/ProcessWelcome", "client:component-export": "ProcessWelcome" })} `, "sidebar": ($$result2) => renderTemplate`${renderComponent($$result2, "ProcessSidebar", ProcessSidebar, { "client:load": true, "slot": "sidebar", "client:component-hydration": "load", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/modules/processes/components/shared/ProcessSidebar", "client:component-export": "ProcessSidebar" })}` })}`;
}, "D:/OneDrive/TatuTec/gerenciar/src/pages/processes/index.astro", void 0);

const $$file = "D:/OneDrive/TatuTec/gerenciar/src/pages/processes/index.astro";
const $$url = "/processes";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
