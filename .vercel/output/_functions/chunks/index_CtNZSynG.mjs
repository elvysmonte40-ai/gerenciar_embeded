import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_CyO4XxjQ.mjs';
import { $ as $$AppLayout } from './AppLayout_9RuWQQJO.mjs';
import { $ as $$AdminSidebar } from './AdminSidebar_CvKCxhaq.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { s as supabase } from './supabase_C4p1dVZL.mjs';

function AuditLogsViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTable, setFilterTable] = useState("");
  const [filterAction, setFilterAction] = useState("");
  useEffect(() => {
    fetchLogs();
  }, [filterTable, filterAction]);
  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", session.user.id).single();
      if (!profile?.organization_id) return;
      let query = supabase.from("audit_logs").select(`
                    id, action, table_name, record_id, created_at,
                    profiles!user_id(full_name, email)
                `).eq("organization_id", profile.organization_id).order("created_at", { ascending: false }).limit(100);
      if (filterTable) {
        query = query.eq("table_name", filterTable);
      }
      if (filterAction) {
        query = query.eq("action", filterAction);
      }
      const { data, error: error2 } = await query;
      if (error2) throw error2;
      if (data) setLogs(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Histórico de Auditoria" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Veja as últimas modificações no sistema." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: filterAction,
            onChange: (e) => setFilterAction(e.target.value),
            className: "text-sm border-gray-300 rounded-md focus:ring-brand focus:border-brand",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Todas as Ações" }),
              /* @__PURE__ */ jsx("option", { value: "INSERT", children: "Inserções (CREATE)" }),
              /* @__PURE__ */ jsx("option", { value: "UPDATE", children: "Atualizações (EDIT)" }),
              /* @__PURE__ */ jsx("option", { value: "DELETE", children: "Exclusões (DELETE)" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: filterTable,
            onChange: (e) => setFilterTable(e.target.value),
            className: "text-sm border-gray-300 rounded-md focus:ring-brand focus:border-brand",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Todos os Módulos" }),
              /* @__PURE__ */ jsx("option", { value: "profiles", children: "Usuários" }),
              /* @__PURE__ */ jsx("option", { value: "organization_roles", children: "Perfis de Acesso" }),
              /* @__PURE__ */ jsx("option", { value: "indicators", children: "Indicadores" }),
              /* @__PURE__ */ jsx("option", { value: "contracts", children: "Contratos" })
            ]
          }
        ),
        /* @__PURE__ */ jsx("button", { onClick: fetchLogs, className: "p-2 border border-gray-300 bg-white rounded-md text-gray-500 hover:text-brand hover:border-brand", children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z", clipRule: "evenodd" }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Ação" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Módulo" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Usuário" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "ID do Registro" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Data" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: loading ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, className: "px-6 py-10 text-center text-gray-500", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-center items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "h-5 w-5 border-2 border-brand border-t-transparent rounded-full animate-spin" }),
        /* @__PURE__ */ jsx("span", { children: "Carregando logs..." })
      ] }) }) }) : logs.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, className: "px-6 py-10 text-center text-gray-500", children: "Nenhum log de auditoria encontrado." }) }) : logs.map((log) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50 transition-colors", children: [
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("span", { className: `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.action === "INSERT" ? "bg-green-100 text-green-800" : log.action === "UPDATE" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}`, children: log.action }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium capitalize", children: log.table_name.replace("_", " ") }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900", children: log.profiles?.full_name || "Sistema" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: log.profiles?.email })
        ] }) }),
        /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-xs", children: [
          log.record_id.slice(0, 8),
          "..."
        ] }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: new Date(log.created_at).toLocaleString("pt-BR") })
      ] }, log.id)) })
    ] }) }),
    error && /* @__PURE__ */ jsxs("div", { className: "p-4 bg-red-50 text-red-700 text-sm border-t border-red-100", children: [
      "Ocorreu um erro ao buscar os dados: ",
      error
    ] })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Logs de Auditoria - Admin" }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="max-w-6xl mx-auto space-y-6"> <div class="flex items-center justify-between"> <h1 class="text-2xl font-bold text-gray-900">
Auditoria do Sistema
</h1> </div> ${renderComponent($$result2, "AuditLogsViewer", AuditLogsViewer, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/modules/admin/components/AuditLogsViewer", "client:component-export": "AuditLogsViewer" })} </div> `, "sidebar": ($$result2) => renderTemplate`${renderComponent($$result2, "AdminSidebar", $$AdminSidebar, { "slot": "sidebar" })}` })}`;
}, "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/audit-logs/index.astro", void 0);

const $$file = "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/audit-logs/index.astro";
const $$url = "/admin/audit-logs";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
