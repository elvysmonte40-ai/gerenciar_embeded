import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_CyO4XxjQ.mjs';
import { $ as $$AppLayout } from './AppLayout_9RuWQQJO.mjs';
import { $ as $$UserSidebar } from './UserSidebar_C3N1AAeC.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { s as supabase } from './supabase_C4p1dVZL.mjs';

const getEmployeeMovements = async (organizationId) => {
  const { data, error } = await supabase.from("employee_movements").select(`
            id,
            type,
            created_at,
            justification,
            profile:profile_id (
                full_name
            ),
            old_department:old_department_id (name),
            new_department:new_department_id (name),
            old_sector:old_sector_id (name),
            new_sector:new_sector_id (name),
            old_job_title:old_job_title_id (title),
            new_job_title:new_job_title_id (title),
            creator:created_by (full_name)
        `).eq("organization_id", organizationId).order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching movements:", error);
    throw error;
  }
  return data;
};

function MovementsList() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    fetchMovements();
  }, []);
  const fetchMovements = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const orgId = session.user.user_metadata.organization_id;
      if (!orgId) return;
      const data = await getEmployeeMovements(orgId);
      setMovements(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const getMovementBadge = (type) => {
    switch (type) {
      case "Promocao":
        return /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800", children: "Promoção" });
      case "Transferencia":
        return /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800", children: "Transferência" });
      case "Alteracao de Cargo":
        return /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800", children: "Alteração de Cargo" });
      case "Alteracao de Setor":
        return /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800", children: "Alteração de Setor" });
      case "Alteracao Cadastral":
        return /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800", children: "Alteração Cadastral" });
      default:
        return /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800", children: type });
    }
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  const renderChange = (movement) => {
    if (movement.type === "Alteracao de Cargo" || movement.type === "Promocao") {
      return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: movement.old_job_title?.title || "-" }),
        /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "→" }),
        /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-900", children: movement.new_job_title?.title || "-" })
      ] });
    }
    if (movement.type === "Transferencia" || movement.type === "Alteracao de Departamento") {
      return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: movement.old_department?.name || "-" }),
        /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "→" }),
        /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-900", children: movement.new_department?.name || "-" })
      ] });
    }
    if (movement.type === "Alteracao de Setor") {
      return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: movement.old_sector?.name || "-" }),
        /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "→" }),
        /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-900", children: movement.new_sector?.name || "-" })
      ] });
    }
    return /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-500", children: "-" });
  };
  return /* @__PURE__ */ jsx("div", { className: "bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden", children: loading ? /* @__PURE__ */ jsx("div", { className: "p-6 text-center text-gray-500", children: "Carregando movimentações..." }) : error ? /* @__PURE__ */ jsxs("div", { className: "p-6 text-center text-red-500", children: [
    "Erro ao carregar: ",
    error
  ] }) : movements.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-6 text-center text-gray-500", children: "Nenhuma movimentação registrada." }) : /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
    /* @__PURE__ */ jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Data" }),
      /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Colaborador" }),
      /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Tipo" }),
      /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "De → Para" }),
      /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Responsável" })
    ] }) }),
    /* @__PURE__ */ jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: movements.map((movement) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50 transition-colors", children: [
      /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: formatDate(movement.created_at) }),
      /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-gray-900", children: movement.profile?.full_name || "Usuário Desconhecido" }) }),
      /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: getMovementBadge(movement.type) }),
      /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: renderChange(movement) }),
      /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: movement.creator?.full_name || "Sistema" })
    ] }, movement.id)) })
  ] }) });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Gerenciar - Movimentações de Colaboradores" }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> ${renderComponent($$result2, "MovementsList", MovementsList, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/modules/users/components/MovementsList", "client:component-export": "default" })} </div> `, "sidebar": ($$result2) => renderTemplate`${renderComponent($$result2, "UserSidebar", $$UserSidebar, { "slot": "sidebar", "currentPath": "/users/movements" })}` })}`;
}, "D:/OneDrive/TatuTec/gerenciar/src/pages/users/movements/index.astro", void 0);

const $$file = "D:/OneDrive/TatuTec/gerenciar/src/pages/users/movements/index.astro";
const $$url = "/users/movements";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
