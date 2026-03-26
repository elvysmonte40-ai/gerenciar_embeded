import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_CyO4XxjQ.mjs';
import { $ as $$AppLayout } from './AppLayout_9RuWQQJO.mjs';
import { $ as $$AdminSidebar } from './AdminSidebar_CvKCxhaq.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { s as supabase } from './supabase_C4p1dVZL.mjs';
import { createPortal } from 'react-dom';

function DashboardForm({ dashboard, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [menus, setMenus] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [reportId, setReportId] = useState("");
  const [menuId, setMenuId] = useState("");
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  useEffect(() => {
    if (isOpen) {
      fetchMenus();
      if (dashboard) {
        setName(dashboard.name);
        setDescription(dashboard.description || "");
        setWorkspaceId(dashboard.workspace_id);
        setReportId(dashboard.report_id);
        setMenuId(dashboard.menu_id || "");
      } else {
        setName("");
        setDescription("");
        setWorkspaceId("");
        setReportId("");
        setMenuId("");
      }
      setError(null);
    }
  }, [isOpen, dashboard]);
  const fetchMenus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", session.user.id).single();
      if (profile?.organization_id) {
        const { data, error: error2 } = await supabase.from("organization_menus").select("id, title").eq("organization_id", profile.organization_id).eq("is_active", true).order("order_index");
        if (data) setMenus(data);
      }
    } catch (err) {
      console.error("Error fetching menus", err);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado");
      const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", session.user.id).single();
      if (!profile?.organization_id) throw new Error("Organização não encontrada");
      const payload = {
        organization_id: profile.organization_id,
        name,
        description,
        workspace_id: workspaceId,
        report_id: reportId,
        menu_id: menuId || null,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      let error2;
      if (dashboard?.id) {
        const res = await supabase.from("organization_dashboards").update(payload).eq("id", dashboard.id);
        error2 = res.error;
      } else {
        const res = await supabase.from("organization_dashboards").insert(payload);
        error2 = res.error;
      }
      if (error2) throw error2;
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving dashboard:", err);
      setError(err.message || "Erro ao salvar dashboard");
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen || !mounted) return null;
  return createPortal(
    /* @__PURE__ */ jsxs("div", { className: "relative z-9999", "aria-labelledby": "modal-title", role: "dialog", "aria-modal": "true", children: [
      /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 transition-opacity", onClick: onClose }),
      /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-10 w-screen overflow-y-auto", children: /* @__PURE__ */ jsx("div", { className: "flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0", children: /* @__PURE__ */ jsxs("div", { className: "relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4", children: /* @__PURE__ */ jsx("div", { className: "sm:flex sm:items-start", children: /* @__PURE__ */ jsxs("div", { className: "mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg leading-6 font-medium text-gray-900", id: "modal-title", children: dashboard ? "Editar Dashboard" : "Novo Dashboard" }),
          /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxs("form", { id: "dashboard-form", onSubmit: handleSubmit, className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700", children: "Nome" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  id: "name",
                  required: true,
                  className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
                  value: name,
                  onChange: (e) => setName(e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "description", className: "block text-sm font-medium text-gray-700", children: "Descrição" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  id: "description",
                  rows: 2,
                  className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
                  value: description,
                  onChange: (e) => setDescription(e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "workspaceId", className: "block text-sm font-medium text-gray-700", children: "Workspace ID" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    id: "workspaceId",
                    required: true,
                    className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
                    value: workspaceId,
                    onChange: (e) => setWorkspaceId(e.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "reportId", className: "block text-sm font-medium text-gray-700", children: "Report ID" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    id: "reportId",
                    required: true,
                    className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
                    value: reportId,
                    onChange: (e) => setReportId(e.target.value)
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "menuId", className: "block text-sm font-medium text-gray-700", children: "Menu Associado (Grupo)" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "menuId",
                  className: "mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
                  value: menuId,
                  onChange: (e) => setMenuId(e.target.value),
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "Selecione um menu..." }),
                    menus.map((menu) => /* @__PURE__ */ jsx("option", { value: menu.id, children: menu.title }, menu.id))
                  ]
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Selecione o menu onde este dashboard será exibido." })
            ] }),
            error && /* @__PURE__ */ jsx("div", { className: "text-red-600 text-sm", children: error })
          ] }) })
        ] }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              form: "dashboard-form",
              disabled: loading,
              className: `w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand text-base font-medium text-white hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand sm:ml-3 sm:w-auto sm:text-sm ${loading ? "opacity-50 cursor-not-allowed" : ""}`,
              children: loading ? "Salvando..." : "Salvar"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm",
              onClick: onClose,
              children: "Cancelar"
            }
          )
        ] })
      ] }) }) })
    ] }),
    document.body
  );
}

function DashboardList() {
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState(null);
  const fetchDashboards = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", session.user.id).single();
      if (!profile?.organization_id) return;
      const { data, error } = await supabase.from("organization_dashboards").select("*").eq("organization_id", profile.organization_id).order("created_at", { ascending: false });
      if (error) throw error;
      setDashboards(data || []);
    } catch (error) {
      console.error("Error fetching dashboards:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDashboards();
  }, []);
  const handleAdd = () => {
    setEditingDashboard(null);
    setIsFormOpen(true);
  };
  const handleEdit = (dashboard) => {
    setEditingDashboard(dashboard);
    setIsFormOpen(true);
  };
  const handleDelete = async (id, name) => {
    if (!confirm(`Tem certeza que deseja excluir o dashboard "${name}"?`)) return;
    try {
      const { error } = await supabase.from("organization_dashboards").delete().eq("id", id);
      if (error) throw error;
      setDashboards(dashboards.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Error deleting dashboard:", error);
      alert("Erro ao excluir dashboard");
    }
  };
  const handleFormSuccess = () => {
    fetchDashboards();
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-base font-semibold text-text-primary flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-brand", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" }) }),
            "Meus Dashboards"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-text-secondary mt-1", children: "Gerencie os relatórios disponíveis para seus usuários." })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleAdd,
            className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors",
            children: [
              /* @__PURE__ */ jsx("svg", { className: "-ml-1 mr-2 h-5 w-5", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z", clipRule: "evenodd" }) }),
              "Novo Dashboard"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: loading ? /* @__PURE__ */ jsx("div", { className: "p-6 text-center text-gray-500 text-sm", children: "Carregando..." }) : dashboards.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-6 text-center text-gray-500 text-sm", children: 'Nenhum dashboard cadastrado. Clique em "Novo Dashboard" para começar.' }) : /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Nome" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "IDs (Workspace/Report)" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Acesso" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "relative px-6 py-3", children: /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Ações" }) })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: dashboards.map((dashboard) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50", children: [
          /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-text-primary", children: dashboard.name }),
            dashboard.description && /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: dashboard.description })
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-gray-500", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "W:" }),
              " ",
              dashboard.workspace_id
            ] }),
            /* @__PURE__ */ jsx("span", { className: "hidden sm:inline text-gray-300", children: "|" }),
            /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "R:" }),
              " ",
              dashboard.report_id
            ] })
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: dashboard.allowed_groups ? /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800", children: dashboard.allowed_groups }) : /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800", children: "Todos" }) }),
          /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: [
            /* @__PURE__ */ jsx("button", { onClick: () => handleEdit(dashboard), className: "text-brand hover:text-brand-dark mr-4", children: "Editar" }),
            /* @__PURE__ */ jsx("button", { onClick: () => handleDelete(dashboard.id, dashboard.name), className: "text-red-600 hover:text-red-900", children: "Excluir" })
          ] })
        ] }, dashboard.id)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(
      DashboardForm,
      {
        isOpen: isFormOpen,
        onClose: () => setIsFormOpen(false),
        onSuccess: handleFormSuccess,
        dashboard: editingDashboard
      }
    )
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Gerenciar Dashboards" }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="px-4 py-6 sm:px-0"> <!-- Dashboard List Component --> ${renderComponent($$result2, "DashboardList", DashboardList, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/modules/admin/components/DashboardList", "client:component-export": "default" })} </div> `, "sidebar": ($$result2) => renderTemplate`${renderComponent($$result2, "AdminSidebar", $$AdminSidebar, { "slot": "sidebar" })}` })}`;
}, "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/dashboards/index.astro", void 0);

const $$file = "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/dashboards/index.astro";
const $$url = "/admin/dashboards";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
