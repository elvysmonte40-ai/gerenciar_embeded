import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_CyO4XxjQ.mjs';
import { $ as $$AppLayout } from './AppLayout_9RuWQQJO.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { s as supabase } from './supabase_C4p1dVZL.mjs';
import { $ as $$AdminSidebar } from './AdminSidebar_CvKCxhaq.mjs';

function SectorList() {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSector, setEditingSector] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  useEffect(() => {
    fetchSectors();
    fetchDepartments();
  }, []);
  useEffect(() => {
    if (isModalOpen) {
      if (editingSector) {
        setName(editingSector.name);
        setDescription(editingSector.description || "");
        setDepartmentId(editingSector.department_id || "");
      } else {
        setName("");
        setDescription("");
        setDepartmentId("");
      }
    }
  }, [isModalOpen, editingSector]);
  const fetchSectors = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const orgId = session.user.user_metadata.organization_id;
      const { data, error: error2 } = await supabase.from("sectors").select("*, creator:profiles!created_by(full_name), department:departments(name)").eq("organization_id", orgId).order("name");
      if (error2) throw error2;
      setSectors(data || []);
    } catch (err) {
      console.error("Error fetching sectors:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const fetchDepartments = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const orgId = session.user.user_metadata.organization_id;
      const { data, error: error2 } = await supabase.from("departments").select("id, name").eq("organization_id", orgId).eq("is_active", true).order("name");
      if (error2) throw error2;
      setDepartments(data || []);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");
      const orgId = session.user.user_metadata.organization_id;
      if (editingSector) {
        const { error: error2 } = await supabase.from("sectors").update({
          name,
          description,
          department_id: departmentId || null
        }).eq("id", editingSector.id);
        if (error2) throw error2;
      } else {
        const { error: error2 } = await supabase.from("sectors").insert({
          organization_id: orgId,
          name,
          description,
          department_id: departmentId || null,
          created_by: session.user.id
        });
        if (error2) throw error2;
      }
      setIsModalOpen(false);
      fetchSectors();
    } catch (err) {
      alert("Error saving: " + err.message);
    } finally {
      setFormLoading(false);
    }
  };
  const handleToggleStatus = async (sector) => {
    if (!confirm(`Deseja ${sector.is_active ? "inativar" : "ativar"} este setor?`)) return;
    try {
      const { error: error2 } = await supabase.from("sectors").update({ is_active: !sector.is_active }).eq("id", sector.id);
      if (error2) throw error2;
      fetchSectors();
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };
  if (loading) return /* @__PURE__ */ jsx("div", { className: "p-4", children: "Carregando..." });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-medium text-gray-900", children: "Setores" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            setEditingSector(null);
            setIsModalOpen(true);
          },
          className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand",
          children: "Novo Setor"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Setor" }),
        /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Departamento" }),
        /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }),
        /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Descrição" }),
        /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Criado em / por" }),
        /* @__PURE__ */ jsx("th", { scope: "col", className: "relative px-6 py-3", children: /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Ações" }) })
      ] }) }),
      /* @__PURE__ */ jsxs("tbody", { className: "bg-white divide-y divide-gray-200", children: [
        sectors.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, className: "px-6 py-12 text-center text-gray-500", children: "Nenhum setor cadastrado." }) }),
        sectors.map((sector) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50 transition-colors group", children: [
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-brand", children: sector.name }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-700", children: sector.department?.name || "-" }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("span", { className: `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sector.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`, children: sector.is_active ? "Ativo" : "Inativo" }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500 line-clamp-2", children: sector.description }) }),
          /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-900", children: new Date(sector.created_at).toLocaleDateString("pt-BR") }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: sector.creator?.full_name || "-" })
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "text-brand hover:text-brand-dark",
                title: "Editar",
                onClick: () => {
                  setEditingSector(sector);
                  setIsModalOpen(true);
                },
                children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleToggleStatus(sector),
                className: "text-red-600 hover:text-red-900",
                title: sector.is_active ? "Inativar" : "Ativar",
                children: sector.is_active ? /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }) : /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" }) })
              }
            )
          ] }) })
        ] }, sector.id))
      ] })
    ] }) }) }),
    isModalOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", "aria-labelledby": "modal-title", role: "dialog", "aria-modal": "true", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0", children: [
      /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 transition-opacity", "aria-hidden": "true", onClick: () => setIsModalOpen(false) }),
      /* @__PURE__ */ jsx("div", { className: "relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg leading-6 font-medium text-gray-900", id: "modal-title", children: editingSector ? "Editar Setor" : "Novo Setor" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-4", children: [
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
              /* @__PURE__ */ jsx("label", { htmlFor: "department", className: "block text-sm font-medium text-gray-700", children: "Departamento" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "department",
                  className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
                  value: departmentId,
                  onChange: (e) => setDepartmentId(e.target.value),
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "Selecione um departamento..." }),
                    departments.map((dept) => /* @__PURE__ */ jsx("option", { value: dept.id, children: dept.name }, dept.id))
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "description", className: "block text-sm font-medium text-gray-700", children: "Descrição" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  id: "description",
                  rows: 3,
                  className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
                  value: description,
                  onChange: (e) => setDescription(e.target.value)
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: formLoading,
              className: "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand text-base font-medium text-white hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50",
              children: formLoading ? "Salvando..." : "Salvar"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm",
              onClick: () => setIsModalOpen(false),
              children: "Cancelar"
            }
          )
        ] })
      ] }) })
    ] }) })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Gerenciar - Setores" }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> ${renderComponent($$result2, "SectorList", SectorList, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/modules/admin/sectors/components/SectorList", "client:component-export": "default" })} </div> `, "sidebar": ($$result2) => renderTemplate`${renderComponent($$result2, "AdminSidebar", $$AdminSidebar, { "slot": "sidebar" })}` })}`;
}, "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/sectors/index.astro", void 0);

const $$file = "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/sectors/index.astro";
const $$url = "/admin/sectors";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
