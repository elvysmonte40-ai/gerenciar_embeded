import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_CyO4XxjQ.mjs';
import { $ as $$AppLayout } from './AppLayout_9RuWQQJO.mjs';
import { $ as $$AdminSidebar } from './AdminSidebar_CvKCxhaq.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { s as supabase } from './supabase_C4p1dVZL.mjs';
import { createPortal } from 'react-dom';
import { DEFAULT_PERMISSIONS, mergePermissions, fetchUserPermissions, hasPermission } from './permissions_CCDHY6zh.mjs';

function RoleForm({ role, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [dashboards, setDashboards] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pbiRoles, setPbiRoles] = useState("");
  const [canExportData, setCanExportData] = useState(false);
  const [selectedDashboardIds, setSelectedDashboardIds] = useState([]);
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  useEffect(() => {
    if (isOpen) {
      fetchDashboards();
      if (role) {
        setName(role.name);
        setDescription(role.description || "");
        setPbiRoles(role.pbi_roles || "");
        setCanExportData(role.can_export_data);
        setPermissions(mergePermissions(role.permissions));
        fetchRoleDashboards(role.id);
      } else {
        setName("");
        setDescription("");
        setPbiRoles("");
        setCanExportData(false);
        setSelectedDashboardIds([]);
        setPermissions(DEFAULT_PERMISSIONS);
      }
      setError(null);
    }
  }, [isOpen, role]);
  const fetchDashboards = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", session.user.id).single();
        if (profile?.organization_id) {
          const { data } = await supabase.from("organization_dashboards").select("*").eq("organization_id", profile.organization_id);
          if (data) setDashboards(data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };
  const fetchRoleDashboards = async (roleId) => {
    try {
      const { data } = await supabase.from("organization_role_dashboards").select("dashboard_id").eq("organization_role_id", roleId);
      if (data) {
        setSelectedDashboardIds(data.map((d) => d.dashboard_id));
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleDashboardToggle = (dashboardId) => {
    setSelectedDashboardIds((prev) => {
      if (prev.includes(dashboardId)) {
        return prev.filter((id) => id !== dashboardId);
      } else {
        return [...prev, dashboardId];
      }
    });
  };
  const handlePermissionChange = (resource, action, value) => {
    setPermissions((prev) => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [action]: value
      }
    }));
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
      const rolePayload = {
        organization_id: profile.organization_id,
        name,
        description,
        pbi_roles: pbiRoles || null,
        can_export_data: canExportData,
        permissions,
        // Save JSONB
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      let savedRoleId = role?.id;
      if (role?.id) {
        const { error: updateError } = await supabase.from("organization_roles").update(rolePayload).eq("id", role.id);
        if (updateError) throw updateError;
      } else {
        const { data: insertedRole, error: insertError } = await supabase.from("organization_roles").insert(rolePayload).select().single();
        if (insertError) throw insertError;
        savedRoleId = insertedRole.id;
      }
      if (!savedRoleId) throw new Error("Erro ao salvar perfil");
      const { error: deleteError } = await supabase.from("organization_role_dashboards").delete().eq("organization_role_id", savedRoleId);
      if (deleteError) throw deleteError;
      if (selectedDashboardIds.length > 0) {
        const junctionPayload = selectedDashboardIds.map((dashboardId) => ({
          organization_role_id: savedRoleId,
          dashboard_id: dashboardId
        }));
        const { error: junctionError } = await supabase.from("organization_role_dashboards").insert(junctionPayload);
        if (junctionError) throw junctionError;
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving role:", err);
      setError(err.message || "Erro ao salvar perfil");
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen || !mounted) return null;
  return createPortal(
    /* @__PURE__ */ jsxs("div", { className: "relative z-9999", "aria-labelledby": "modal-title", role: "dialog", "aria-modal": "true", children: [
      /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 transition-opacity", onClick: onClose }),
      /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-10 w-screen overflow-y-auto", children: /* @__PURE__ */ jsx("div", { className: "flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0", children: /* @__PURE__ */ jsxs("div", { className: "relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4", children: /* @__PURE__ */ jsx("div", { className: "sm:flex sm:items-start", children: /* @__PURE__ */ jsxs("div", { className: "mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg leading-6 font-medium text-gray-900", id: "modal-title", children: role ? "Editar Perfil" : "Novo Perfil" }),
          /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxs("form", { id: "role-form", onSubmit: handleSubmit, className: "space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700", children: "Nome do Perfil" }),
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
                /* @__PURE__ */ jsx("label", { htmlFor: "pbiRoles", className: "block text-sm font-medium text-gray-700", children: "Papéis Power BI (Roles)" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    id: "pbiRoles",
                    placeholder: "ex: Sales, Manager (separados por vírgula)",
                    className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
                    value: pbiRoles,
                    onChange: (e) => setPbiRoles(e.target.value)
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
                  rows: 2,
                  className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
                  value: description,
                  onChange: (e) => setDescription(e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-gray-900 mb-3 block", children: "Permissões de Acesso" }),
                /* @__PURE__ */ jsx("div", { className: "border border-gray-200 rounded-md overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
                  /* @__PURE__ */ jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsx("th", { scope: "col", className: "px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Módulo" }),
                    /* @__PURE__ */ jsx("th", { scope: "col", className: "px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Ver" }),
                    /* @__PURE__ */ jsx("th", { scope: "col", className: "px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Criar" }),
                    /* @__PURE__ */ jsx("th", { scope: "col", className: "px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Editar" }),
                    /* @__PURE__ */ jsx("th", { scope: "col", className: "px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Excluir" })
                  ] }) }),
                  /* @__PURE__ */ jsxs("tbody", { className: "bg-white divide-y divide-gray-200", children: [
                    [
                      { key: "users", label: "Usuários" },
                      { key: "processes", label: "Processos" },
                      { key: "indicators", label: "Indicadores" },
                      { key: "profiles", label: "Perfis de Acesso" },
                      { key: "contracts", label: "Contratos" }
                    ].map((module) => /* @__PURE__ */ jsxs("tr", { children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900", children: module.label }),
                      ["view", "create", "edit", "delete"].map((action) => /* @__PURE__ */ jsx("td", { className: "px-3 py-2 whitespace-nowrap text-center", children: /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: "checkbox",
                          className: "h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand",
                          checked: permissions[module.key][action],
                          onChange: (e) => handlePermissionChange(module.key, action, e.target.checked)
                        }
                      ) }, action))
                    ] }, module.key)),
                    /* @__PURE__ */ jsxs("tr", { children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900", children: "Configurações" }),
                      /* @__PURE__ */ jsx("td", { colSpan: 4, className: "px-3 py-2 text-left", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            type: "checkbox",
                            id: "perm-settings",
                            className: "h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand mr-2",
                            checked: permissions.organization.manage_settings,
                            onChange: (e) => handlePermissionChange("organization", "manage_settings", e.target.checked)
                          }
                        ),
                        /* @__PURE__ */ jsx("label", { htmlFor: "perm-settings", className: "text-sm text-gray-700", children: "Gerenciar Configurações da Organização" })
                      ] }) })
                    ] })
                  ] })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between py-2 border-b border-gray-100 pb-4", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900", children: "Exportar Dados" }),
                    /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: "Permitir que usuários deste perfil exportem dados do Power BI" })
                  ] }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      className: `${canExportData ? "bg-brand" : "bg-gray-200"} relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2`,
                      role: "switch",
                      "aria-checked": canExportData,
                      onClick: () => setCanExportData(!canExportData),
                      children: /* @__PURE__ */ jsx("span", { className: `${canExportData ? "translate-x-5" : "translate-x-0"} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out` })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Dashboards Permitidos" }),
                  /* @__PURE__ */ jsx("div", { className: "border border-gray-300 rounded-md max-h-60 overflow-y-auto divide-y divide-gray-100 bg-gray-50", children: dashboards.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-4 text-sm text-gray-500 text-center", children: "Nenhum dashboard disponível." }) : dashboards.map((dash) => /* @__PURE__ */ jsxs("div", { className: "relative flex items-start px-4 py-3 hover:bg-white transition-colors", children: [
                    /* @__PURE__ */ jsx("div", { className: "min-w-0 flex-1 text-sm", children: /* @__PURE__ */ jsxs("label", { htmlFor: `dash-${dash.id}`, className: "font-medium text-gray-700 select-none cursor-pointer block", children: [
                      dash.name,
                      dash.description && /* @__PURE__ */ jsx("span", { className: "block text-gray-500 text-xs font-normal mt-0.5", children: dash.description })
                    ] }) }),
                    /* @__PURE__ */ jsx("div", { className: "ml-3 flex h-5 items-center", children: /* @__PURE__ */ jsx(
                      "input",
                      {
                        id: `dash-${dash.id}`,
                        name: `dash-${dash.id}`,
                        type: "checkbox",
                        className: "h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand",
                        checked: selectedDashboardIds.includes(dash.id),
                        onChange: () => handleDashboardToggle(dash.id)
                      }
                    ) })
                  ] }, dash.id)) }),
                  /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-gray-500 text-right", children: [
                    selectedDashboardIds.length,
                    " dashboards selecionados"
                  ] })
                ] })
              ] })
            ] }),
            error && /* @__PURE__ */ jsx("div", { className: "text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-100", children: error })
          ] }) })
        ] }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              form: "role-form",
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

function RoleList() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [dashboardCounts, setDashboardCounts] = useState({});
  const [permissions, setPermissions] = useState(null);
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  useEffect(() => {
    fetchRoles();
  }, []);
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const perms = await fetchUserPermissions(session.user.id);
      setPermissions(perms.permissions);
      setIsOrgAdmin(perms.isOrgAdmin);
      const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", session.user.id).single();
      if (profile?.organization_id) {
        const { data, error } = await supabase.from("organization_roles").select("*").eq("organization_id", profile.organization_id).order("created_at", { ascending: false });
        if (error) throw error;
        setRoles(data || []);
        if (data && data.length > 0) {
          const roleIds = data.map((r) => r.id);
          const { data: junctionData } = await supabase.from("organization_role_dashboards").select("organization_role_id").in("organization_role_id", roleIds);
          if (junctionData) {
            const counts = {};
            junctionData.forEach((row) => {
              counts[row.organization_role_id] = (counts[row.organization_role_id] || 0) + 1;
            });
            setDashboardCounts(counts);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (role) => {
    setSelectedRole(role);
    setIsFormOpen(true);
  };
  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este perfil?")) return;
    try {
      const { error } = await supabase.from("organization_roles").delete().eq("id", id);
      if (error) throw error;
      fetchRoles();
    } catch (error) {
      console.error("Error deleting role:", error);
      alert("Erro ao excluir perfil. Verifique se existem usuários vinculados.");
    }
  };
  const handleToggleStatus = async (role) => {
    try {
      const { error } = await supabase.from("organization_roles").update({ is_active: !role.is_active }).eq("id", role.id);
      if (error) throw error;
      fetchRoles();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  const openCreateModal = () => {
    setSelectedRole(null);
    setIsFormOpen(true);
  };
  const canManage = hasPermission(permissions, "organization", "manage_settings", isOrgAdmin);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-medium text-gray-900", children: "Perfis de Acesso" }),
      canManage && /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: openCreateModal,
          className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand",
          children: [
            /* @__PURE__ */ jsx("svg", { className: "-ml-1 mr-2 h-5 w-5", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z", clipRule: "evenodd" }) }),
            "Novo Perfil"
          ]
        }
      )
    ] }),
    loading ? /* @__PURE__ */ jsx("div", { className: "text-center py-10", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto" }) }) : /* @__PURE__ */ jsx("div", { className: "bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Nome / Descrição" }),
        /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Dashboards" }),
        /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Exportar Dados" }),
        /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }),
        /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Ações" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: roles.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, className: "px-6 py-10 text-center text-gray-500 text-sm", children: "Nenhum perfil cadastrado." }) }) : roles.map((role) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxs("td", { className: "px-6 py-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-gray-900", children: role.name }),
          role.description && /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: role.description }),
          role.pbi_roles && /* @__PURE__ */ jsxs("div", { className: "text-xs text-brand font-mono mt-1 bg-brand-light/20 inline-block px-1 rounded", children: [
            "Roles: ",
            role.pbi_roles
          ] })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500", children: /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800", children: dashboardCounts[role.id] || 0 }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500", children: role.can_export_data ? /* @__PURE__ */ jsx("span", { className: "text-green-600 font-semibold text-xs", children: "Sim" }) : /* @__PURE__ */ jsx("span", { className: "text-gray-400 text-xs", children: "Não" }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-center whitespace-nowrap", children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => canManage && handleToggleStatus(role),
            disabled: !canManage,
            className: `relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${role.is_active ? "bg-green-500" : "bg-gray-200"} ${!canManage ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`,
            children: /* @__PURE__ */ jsx("span", { className: `pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${role.is_active ? "translate-x-5" : "translate-x-0"}` })
          }
        ) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-right whitespace-nowrap text-sm font-medium", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3", children: [
          canManage && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleEdit(role),
              className: "text-indigo-600 hover:text-indigo-900",
              children: "Editar"
            }
          ),
          canManage && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleDelete(role.id),
              className: "text-red-600 hover:text-red-900",
              children: "Excluir"
            }
          )
        ] }) })
      ] }, role.id)) })
    ] }) }),
    /* @__PURE__ */ jsx(
      RoleForm,
      {
        isOpen: isFormOpen,
        onClose: () => setIsFormOpen(false),
        onSuccess: () => {
          fetchRoles();
        },
        role: selectedRole
      }
    )
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Gerenciamento de Perfis" }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="px-4 py-6 sm:px-0"> ${renderComponent($$result2, "RoleList", RoleList, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/modules/admin/components/RoleList", "client:component-export": "default" })} </div> `, "sidebar": ($$result2) => renderTemplate`${renderComponent($$result2, "AdminSidebar", $$AdminSidebar, { "slot": "sidebar", "activeItem": "perfis" })}` })}`;
}, "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/perfis/index.astro", void 0);

const $$file = "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/perfis/index.astro";
const $$url = "/admin/perfis";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
