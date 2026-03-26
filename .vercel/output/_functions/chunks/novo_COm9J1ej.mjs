import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_CyO4XxjQ.mjs';
import { P as ProcessService, $ as $$AppLayout } from './AppLayout_9RuWQQJO.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { s as supabase } from './supabase_C4p1dVZL.mjs';
import { fetchUserPermissions, hasPermission } from './permissions_CCDHY6zh.mjs';

const ProcessCreate = () => {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedApprovers, setSelectedApprovers] = useState([]);
  const [selectedViewerRoles, setSelectedViewerRoles] = useState([]);
  const [selectedEditorRoles, setSelectedEditorRoles] = useState([]);
  const [pools, setPools] = useState([]);
  const [newPool, setNewPool] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { permissions, isOrgAdmin } = await fetchUserPermissions(session.user.id);
      if (!hasPermission(permissions, "processes", "create", isOrgAdmin)) {
        window.location.href = "/processes";
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", session.user.id).single();
      if (profile?.organization_id) {
        const { data: depts } = await supabase.from("departments").select("*").eq("organization_id", profile.organization_id).eq("is_active", true).order("name");
        if (depts) setDepartments(depts);
        const { data: orgUsers } = await supabase.from("profiles").select("*").eq("organization_id", profile.organization_id).neq("id", session.user.id).order("full_name");
        if (orgUsers) setUsers(orgUsers);
        const { data: orgRoles } = await supabase.from("organization_roles").select("*").eq("organization_id", profile.organization_id).eq("is_active", true).order("name");
        if (orgRoles) setRoles(orgRoles);
      }
    };
    loadData();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado");
      const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", session.user.id).single();
      if (!profile?.organization_id) throw new Error("Organização não encontrada");
      const { process, version } = await ProcessService.createProcess({
        title,
        code: code || null,
        description: description || null,
        department_id: departmentId || null,
        organization_id: profile.organization_id,
        created_by: session.user.id
      }, selectedViewerRoles, selectedEditorRoles, pools.length > 0 ? pools : void 0);
      if (selectedApprovers.length > 0) {
        await Promise.all(selectedApprovers.map(
          (userId) => ProcessService.addApprover(version.id, userId)
        ));
      }
      window.location.href = `/processes/${process.id}/editar`;
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro ao criar processo");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Novo Processo" }),
    error && /* @__PURE__ */ jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6", children: error }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "title", className: "block text-sm font-medium text-gray-700", children: "Título do Processo *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "title",
            required: true,
            className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
            value: title,
            onChange: (e) => setTitle(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "code", className: "block text-sm font-medium text-gray-700", children: "Código (Opcional)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              id: "code",
              className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
              value: code,
              onChange: (e) => setCode(e.target.value),
              placeholder: "Ex: PROC-001"
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
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "description", className: "block text-sm font-medium text-gray-700", children: "Descrição" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "description",
            rows: 4,
            className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
            value: description,
            onChange: (e) => setDescription(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Piscinas (Pools / Setores Envolvidos)" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              className: "flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
              placeholder: "Ex: Financeiro, Cliente Externo, Fornecedor",
              value: newPool,
              onChange: (e) => setNewPool(e.target.value),
              onKeyDown: (e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (newPool.trim() && !pools.includes(newPool.trim())) {
                    setPools([...pools, newPool.trim()]);
                    setNewPool("");
                  }
                }
              }
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                if (newPool.trim() && !pools.includes(newPool.trim())) {
                  setPools([...pools, newPool.trim()]);
                  setNewPool("");
                }
              },
              className: "px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors",
              children: "Adicionar"
            }
          )
        ] }),
        pools.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: pools.map((pool, idx) => /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200", children: [
          pool,
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setPools(pools.filter((_, i) => i !== idx)),
              className: "text-blue-500 hover:text-blue-700",
              children: "×"
            }
          )
        ] }, idx)) }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Liste os atores ou setores principais que farão parte deste fluxo. Estas piscinas estarão disponíveis para selecionar em cada passo no editor." })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Aprovadores" }),
        /* @__PURE__ */ jsx("div", { className: "border border-gray-300 rounded-md shadow-sm max-h-48 overflow-y-auto p-2 bg-gray-50", children: users.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-2", children: users.map((user) => /* @__PURE__ */ jsxs("label", { className: "flex items-center space-x-3 p-2 hover:bg-white rounded cursor-pointer transition-colors", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              value: user.id,
              checked: selectedApprovers.includes(user.id),
              onChange: (e) => {
                if (e.target.checked) {
                  setSelectedApprovers([...selectedApprovers, user.id]);
                } else {
                  setSelectedApprovers(selectedApprovers.filter((id) => id !== user.id));
                }
              },
              className: "h-4 w-4 text-brand focus:ring-brand border-gray-300 rounded"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900", children: user.full_name || "Sem nome" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: user.job_title || user.email })
          ] })
        ] }, user.id)) }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 p-2", children: "Nenhum outro usuário encontrado na organização." }) }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Selecione quem será responsável por aprovar as versões deste processo." })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Perfis que podem visualizar este processo" }),
        /* @__PURE__ */ jsx("div", { className: "border border-gray-300 rounded-md shadow-sm max-h-48 overflow-y-auto p-2 bg-gray-50", children: roles.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-2", children: roles.map((role) => /* @__PURE__ */ jsxs("label", { className: "flex items-center space-x-3 p-2 hover:bg-white rounded cursor-pointer transition-colors", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              value: role.id,
              checked: selectedViewerRoles.includes(role.id),
              onChange: (e) => {
                if (e.target.checked) {
                  setSelectedViewerRoles([...selectedViewerRoles, role.id]);
                } else {
                  setSelectedViewerRoles(selectedViewerRoles.filter((id) => id !== role.id));
                }
              },
              className: "h-4 w-4 text-brand focus:ring-brand border-gray-300 rounded"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900", children: role.name }),
            role.description && /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: role.description })
          ] })
        ] }, role.id)) }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 p-2", children: "Nenhum perfil encontrado na organização." }) }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Se nenhum perfil for selecionado, o processo será visível para todos da organização. Administradores sempre terão acesso." })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Perfis que podem editar este processo" }),
        /* @__PURE__ */ jsx("div", { className: "border border-gray-300 rounded-md shadow-sm max-h-48 overflow-y-auto p-2 bg-gray-50", children: roles.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-2", children: roles.map((role) => /* @__PURE__ */ jsxs("label", { className: "flex items-center space-x-3 p-2 hover:bg-white rounded cursor-pointer transition-colors", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              value: role.id,
              checked: selectedEditorRoles.includes(role.id),
              onChange: (e) => {
                if (e.target.checked) {
                  setSelectedEditorRoles([...selectedEditorRoles, role.id]);
                } else {
                  setSelectedEditorRoles(selectedEditorRoles.filter((id) => id !== role.id));
                }
              },
              className: "h-4 w-4 text-brand focus:ring-brand border-gray-300 rounded"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900", children: role.name }),
            role.description && /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: role.description })
          ] })
        ] }, `editor-${role.id}`)) }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 p-2", children: "Nenhum perfil encontrado na organização." }) }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Selecione os perfis que terão permissão para editar este processo (além dos administradores e de quem já possui permissão global)." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 pt-4", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/processes",
            className: "bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand",
            children: "Cancelar"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50",
            children: loading ? "Criando..." : "Criar Processo"
          }
        )
      ] })
    ] })
  ] });
};

const $$Novo = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Novo Processo" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-7xl mx-auto py-6"> ${renderComponent($$result2, "ProcessCreate", ProcessCreate, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/modules/processes/components/create/ProcessCreate", "client:component-export": "ProcessCreate" })} </div> ` })}`;
}, "D:/OneDrive/TatuTec/gerenciar/src/pages/processes/novo.astro", void 0);

const $$file = "D:/OneDrive/TatuTec/gerenciar/src/pages/processes/novo.astro";
const $$url = "/processes/novo";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Novo,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
