import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { o as createRenderInstruction, r as renderTemplate, l as renderComponent, p as renderSlot, h as addAttribute, q as renderHead } from './entrypoint_CyO4XxjQ.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { s as supabase } from './supabase_C4p1dVZL.mjs';
import { Bell, CheckCircle, Info } from 'lucide-react';

async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}</script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"></script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}

function ProfileModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    const handleOpen = (e) => {
      const mode = e.detail?.mode || "profile";
      setActiveTab(mode);
      setIsOpen(true);
      fetchProfile();
    };
    window.addEventListener("open-profile-modal", handleOpen);
    return () => window.removeEventListener("open-profile-modal", handleOpen);
  }, []);
  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      setEmail(user.email || "");
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      if (profile) {
        setFullName(profile.full_name || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { error: profileError } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", userId);
      if (profileError) throw profileError;
      setMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
      window.dispatchEvent(new Event("profile-updated"));
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "As senhas não coincidem." });
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setMessage({ type: "error", text: "A senha deve ter pelo menos 6 caracteres." });
      setLoading(false);
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage({ type: "success", text: "Senha alterada com sucesso!" });
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;
  return createPortal(
    /* @__PURE__ */ jsxs("div", { className: "relative z-100", "aria-labelledby": "modal-title", role: "dialog", "aria-modal": "true", children: [
      /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 transition-opacity", onClick: () => setIsOpen(false) }),
      /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-10 w-screen overflow-y-auto", children: /* @__PURE__ */ jsx("div", { className: "flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0", children: /* @__PURE__ */ jsxs("div", { className: "relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100", children: /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium leading-6 text-gray-900", children: "Minha Conta" }) }),
        /* @__PURE__ */ jsx("div", { className: "border-b border-gray-200", children: /* @__PURE__ */ jsxs("nav", { className: "-mb-px flex px-6 space-x-8", "aria-label": "Tabs", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setActiveTab("profile");
                setMessage(null);
              },
              className: `${activeTab === "profile" ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`,
              children: "Dados Pessoais"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setActiveTab("security");
                setMessage(null);
              },
              className: `${activeTab === "security" ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`,
              children: "Segurança"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "px-6 py-6", children: [
          message && /* @__PURE__ */ jsx("div", { className: `mb-4 p-3 rounded text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`, children: message.text }),
          activeTab === "profile" ? /* @__PURE__ */ jsxs("form", { onSubmit: handleUpdateProfile, className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Email" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "email",
                  disabled: true,
                  className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm",
                  value: email
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500", children: "O email não pode ser alterado por aqui." })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Nome Completo" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  required: true,
                  className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
                  value: fullName,
                  onChange: (e) => setFullName(e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "pt-4 flex justify-end", children: /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                disabled: loading,
                className: "inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand text-base font-medium text-white hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand sm:text-sm disabled:opacity-50",
                children: loading ? "Salvando..." : "Salvar Alterações"
              }
            ) })
          ] }) : /* @__PURE__ */ jsxs("form", { onSubmit: handleUpdatePassword, className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Nova Senha" }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: showPassword ? "text" : "password",
                    required: true,
                    minLength: 6,
                    className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm pr-10",
                    value: password,
                    onChange: (e) => setPassword(e.target.value),
                    placeholder: "Mínimo 6 caracteres"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: "absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700 focus:outline-none",
                    onClick: () => setShowPassword(!showPassword),
                    children: showPassword ? /* @__PURE__ */ jsx("svg", { className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" }) }) : /* @__PURE__ */ jsxs("svg", { className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: [
                      /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" }),
                      /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" })
                    ] })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Confirmar Nova Senha" }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: showPassword ? "text" : "password",
                    required: true,
                    minLength: 6,
                    className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm pr-10",
                    value: confirmPassword,
                    onChange: (e) => setConfirmPassword(e.target.value),
                    placeholder: "Repita a nova senha"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: "absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700 focus:outline-none",
                    onClick: () => setShowPassword(!showPassword),
                    children: showPassword ? /* @__PURE__ */ jsx("svg", { className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" }) }) : /* @__PURE__ */ jsxs("svg", { className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: [
                      /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" }),
                      /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" })
                    ] })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "pt-4 flex justify-end", children: /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                disabled: loading,
                className: "inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand text-base font-medium text-white hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand sm:text-sm disabled:opacity-50",
                children: loading ? "Redefinir Senha" : "Redefinir Senha"
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse", children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm",
            onClick: () => setIsOpen(false),
            children: "Fechar"
          }
        ) })
      ] }) }) })
    ] }),
    document.body
  );
}

const SystemMessageManager = () => {
  const [messages, setMessages] = useState([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    checkMessages();
  }, []);
  const checkMessages = async () => {
    const {
      data: { session }
    } = await supabase.auth.getSession();
    if (!session) return;
    setUserId(session.user.id);
    const { data: profile } = await supabase.from("profiles").select("role, organization_id").eq("id", session.user.id).single();
    if (!profile) return;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const { data: allMessages, error } = await supabase.from("system_messages").select("*").eq("status", "active").eq("organization_id", profile.organization_id).or(`start_date.is.null,start_date.lte.${now}`).or(`end_date.is.null,end_date.gte.${now}`);
    if (error || !allMessages) return;
    const { data: reads } = await supabase.from("system_message_reads").select("message_id").eq("user_id", session.user.id);
    const readIds = new Set(reads?.map((r) => r.message_id));
    const relevantMessages = allMessages.filter((msg) => {
      if (readIds.has(msg.id)) return false;
      if (msg.target_audience === "all") return true;
      const targetIds = Array.isArray(msg.target_ids) ? msg.target_ids : [];
      if (msg.target_audience === "profile") {
        return targetIds.includes(profile.role);
      }
      if (msg.target_audience === "user") {
        return targetIds.includes(session.user.id);
      }
      return false;
    });
    if (relevantMessages.length > 0) {
      setMessages(relevantMessages);
      setIsOpen(true);
    }
  };
  const handleClose = async (markRead) => {
    if (!userId || messages.length === 0) return;
    const currentMsg = messages[currentMessageIndex];
    if (markRead) {
      await supabase.from("system_message_reads").insert({
        message_id: currentMsg.id,
        user_id: userId
      });
    }
    if (currentMessageIndex < messages.length - 1) {
      setCurrentMessageIndex(currentMessageIndex + 1);
    } else {
      setIsOpen(false);
    }
  };
  useEffect(() => {
    const handleOpenMessage = (e) => {
      const msg = e.detail.message;
      if (msg) {
        setMessages([msg]);
        setCurrentMessageIndex(0);
        setIsOpen(true);
      }
    };
    window.addEventListener("open-system-message", handleOpenMessage);
    return () => window.removeEventListener("open-system-message", handleOpenMessage);
  }, []);
  if (!isOpen || messages.length === 0) return null;
  const message = messages[currentMessageIndex];
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200", children: [
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-text-primary", children: message.title }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => handleClose(false),
          className: "text-text-secondary hover:text-text-primary focus:outline-none",
          children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto p-6 prose prose-sm max-w-none text-text-primary", children: /* @__PURE__ */ jsx("div", { dangerouslySetInnerHTML: { __html: message.content } }) }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center", children: [
      /* @__PURE__ */ jsxs("span", { className: "text-xs text-text-secondary", children: [
        currentMessageIndex + 1,
        " de ",
        messages.length
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleClose(false),
            className: "px-4 py-2 text-sm text-text-secondary hover:text-text-primary font-medium",
            children: "Ler depois"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleClose(true),
            className: "px-4 py-2 bg-brand text-white text-sm font-medium rounded-md hover:bg-brand-dark shadow-sm transition-colors",
            children: "Marcar como lido"
          }
        )
      ] })
    ] })
  ] }) });
};

const ProcessService = {
  // --- Processes ---
  async listProcesses(organizationId, filters) {
    let query = supabase.from("processes").select(`
                *,
                department:departments(name),
                viewer_roles:process_viewer_roles(organization_role_id),
                editor_roles:process_editor_roles(organization_role_id),
                current_version:process_versions!fk_processes_current_version(*),
                versions:process_versions!process_versions_process_id_fkey(
                    id, 
                    status, 
                    version_number, 
                    created_at,
                    approvers:process_version_approvers(id, status, user_id)
                )
            `).eq("organization_id", organizationId).eq("is_active", true);
    if (filters?.departmentId) {
      query = query.eq("department_id", filters.departmentId);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
    }
    const { data, error } = await query.order("title");
    if (error) throw error;
    const userIds = /* @__PURE__ */ new Set();
    data?.forEach((process) => {
      process.versions?.forEach((version) => {
        version.approvers?.forEach((approver) => {
          if (approver.user_id) userIds.add(approver.user_id);
        });
      });
    });
    if (userIds.size > 0) {
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, email, job_title").in("id", Array.from(userIds));
      const profileMap = new Map(profiles?.map((p) => [p.id, p]));
      data?.forEach((process) => {
        process.versions?.forEach((version) => {
          version.approvers = version.approvers?.map((approver) => ({
            ...approver,
            user: profileMap.get(approver.user_id) || null
          }));
        });
      });
    }
    return data;
  },
  async getProcessById(id) {
    const { data, error } = await supabase.from("processes").select(`
                *,
                department:departments(name),
                viewer_roles:process_viewer_roles(organization_role_id),
                editor_roles:process_editor_roles(organization_role_id),
                current_version:process_versions!fk_processes_current_version(*)
            `).eq("id", id).single();
    if (error) throw error;
    return data;
  },
  async getProcessByCode(code, organizationId) {
    const { data, error } = await supabase.from("processes").select(`
                *,
                department:departments(name),
                viewer_roles:process_viewer_roles(organization_role_id),
                editor_roles:process_editor_roles(organization_role_id),
                current_version:process_versions!fk_processes_current_version(*)
            `).eq("code", code).eq("organization_id", organizationId).single();
    if (error) throw error;
    return data;
  },
  async createProcess(processData, viewerRoleIds, editorRoleIds, pools) {
    const processInsertData = { ...processData };
    if (pools) {
      processInsertData.pools = pools;
    }
    const { data: process, error: processError } = await supabase.from("processes").insert(processInsertData).select().single();
    if (processError) throw processError;
    if (viewerRoleIds && viewerRoleIds.length > 0) {
      await this.saveProcessViewerRoles(process.id, viewerRoleIds);
    }
    if (editorRoleIds && editorRoleIds.length > 0) {
      await this.saveProcessEditorRoles(process.id, editorRoleIds);
    }
    const { data: version, error: versionError } = await supabase.from("process_versions").insert({
      process_id: process.id,
      version_number: 1,
      status: "draft",
      created_by: process.created_by
    }).select().single();
    if (versionError) {
      await supabase.from("processes").delete().eq("id", process.id);
      throw versionError;
    }
    return { process, version };
  },
  async updateProcess(id, updates) {
    const { data, error } = await supabase.from("processes").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  async saveProcessViewerRoles(processId, roleIds) {
    await supabase.from("process_viewer_roles").delete().eq("process_id", processId);
    if (roleIds.length > 0) {
      const inserts = roleIds.map((roleId) => ({
        process_id: processId,
        organization_role_id: roleId
      }));
      const { error } = await supabase.from("process_viewer_roles").insert(inserts);
      if (error) throw error;
    }
  },
  async getProcessViewerRoles(processId) {
    const { data, error } = await supabase.from("process_viewer_roles").select("organization_role_id").eq("process_id", processId);
    if (error) throw error;
    return data.map((r) => r.organization_role_id);
  },
  async saveProcessEditorRoles(processId, roleIds) {
    await supabase.from("process_editor_roles").delete().eq("process_id", processId);
    if (roleIds.length > 0) {
      const inserts = roleIds.map((roleId) => ({
        process_id: processId,
        organization_role_id: roleId
      }));
      const { error } = await supabase.from("process_editor_roles").insert(inserts);
      if (error) throw error;
    }
  },
  async getProcessEditorRoles(processId) {
    const { data, error } = await supabase.from("process_editor_roles").select("organization_role_id").eq("process_id", processId);
    if (error) throw error;
    return data.map((r) => r.organization_role_id);
  },
  // --- Versions ---
  async getVersions(processId) {
    const { data, error } = await supabase.from("process_versions").select("*").eq("process_id", processId).order("version_number", { ascending: false });
    if (error) throw error;
    return data;
  },
  async getVersionById(id) {
    const { data, error } = await supabase.from("process_versions").select(`
                *,
                steps:process_steps(*),
                attachments:process_attachments(*),
                approvers:process_version_approvers(*),
                process:processes!process_versions_process_id_fkey(*)
            `).eq("id", id).single();
    if (error) throw error;
    if (data && data.steps) {
      data.steps.sort((a, b) => a.order_index - b.order_index);
    }
    return data;
  },
  async createNextVersion(processId, previousVersionId, userId) {
    const { data: prev, error: fetchError } = await supabase.from("process_versions").select("version_number, flow_data").eq("id", previousVersionId).single();
    if (fetchError) throw fetchError;
    const nextVersionNumber = prev.version_number + 1;
    const { data: newVersion, error: createError } = await supabase.from("process_versions").insert({
      process_id: processId,
      version_number: nextVersionNumber,
      status: "draft",
      flow_data: prev.flow_data,
      // Copy flow
      created_by: userId
    }).select().single();
    if (createError) throw createError;
    const { data: steps } = await supabase.from("process_steps").select("*").eq("process_version_id", previousVersionId);
    if (steps && steps.length > 0) {
      const newSteps = steps.map((s) => ({
        process_version_id: newVersion.id,
        order_index: s.order_index,
        title: s.title,
        role_responsible: s.role_responsible,
        description_html: s.description_html,
        metadata: s.metadata
      }));
      await supabase.from("process_steps").insert(newSteps);
    }
    return newVersion;
  },
  async updateVersion(id, updates) {
    const { data, error } = await supabase.from("process_versions").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  // --- Steps ---
  async saveSteps(versionId, steps) {
    const { error } = await supabase.from("process_steps").upsert(
      steps.map((s) => ({
        ...s,
        process_version_id: versionId
      }))
    );
    if (error) throw error;
  },
  async deleteStep(stepId) {
    const { error } = await supabase.from("process_steps").delete().eq("id", stepId);
    if (error) throw error;
  },
  // --- Approvals ---
  async getApprovers(versionId) {
    const { data, error } = await supabase.from("process_version_approvers").select(`
                *,
                user:user_id(email) -- Note: user_id joins to auth.users, might not be visible easily via standard client if RLS restricts. 
                                    -- Using profiles table is safer for names.
            `).eq("process_version_id", versionId);
    if (error) throw error;
    return data;
  },
  // Helper to get profile info for approvers
  async getApproversWithProfiles(versionId) {
    const { data: approvers, error } = await supabase.from("process_version_approvers").select("*").eq("process_version_id", versionId);
    if (error) throw error;
    if (!approvers.length) return [];
    const userIds = approvers.map((a) => a.user_id);
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, email, job_title").in("id", userIds);
    return approvers.map((a) => ({
      ...a,
      profile: profiles?.find((p) => p.id === a.user_id)
    }));
  },
  async addApprover(versionId, userId) {
    const { data, error } = await supabase.from("process_version_approvers").insert({
      process_version_id: versionId,
      user_id: userId,
      status: "pending"
    }).select().single();
    if (error) throw error;
    return data;
  },
  async removeApprover(approverId) {
    const { error } = await supabase.from("process_version_approvers").delete().eq("id", approverId);
    if (error) throw error;
  },
  async getPendingApprovals(userId) {
    const { data, error } = await supabase.from("process_version_approvers").select(`
                *,
                version:process_versions!fk_approvers_version(
                    id, version_number, status,
                    process:processes(title, code)
                )
            `).eq("user_id", userId).eq("status", "pending");
    if (error) throw error;
    return data;
  },
  async reviewVersion(versionId, userId, status, comments) {
    const { data, error } = await supabase.from("process_version_approvers").update({
      status,
      comments,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).match({ process_version_id: versionId, user_id: userId }).select().single();
    if (error) throw error;
    if (status === "rejected") {
      await this.updateVersion(versionId, { status: "draft" });
    } else if (status === "approved") {
      const { data: allApprovers } = await supabase.from("process_version_approvers").select("status").eq("process_version_id", versionId);
      const allApproved = allApprovers?.every((a) => a.status === "approved");
      if (allApproved) {
        await this.publishVersion(versionId, userId);
      }
    }
    return data;
  },
  async requestApproval(versionId) {
    const { count } = await supabase.from("process_version_approvers").select("*", { count: "exact", head: true }).eq("process_version_id", versionId);
    if (!count || count === 0) throw new Error("É necessário definir pelo menos um aprovador.");
    await supabase.from("process_version_approvers").update({ status: "pending", comments: null }).eq("process_version_id", versionId);
    return this.updateVersion(versionId, { status: "awaiting_approval" });
  },
  async publishVersion(versionId, userId) {
    const { data: version } = await supabase.from("process_versions").select("process_id, version_number").eq("id", versionId).single();
    if (!version) throw new Error("Versão não encontrada");
    await supabase.from("process_versions").update({ status: "archived" }).eq("process_id", version.process_id).eq("status", "published");
    const { data: published, error } = await supabase.from("process_versions").update({
      status: "published",
      published_at: (/* @__PURE__ */ new Date()).toISOString(),
      published_by: userId
    }).eq("id", versionId).select().single();
    if (error) throw error;
    await supabase.from("processes").update({ current_version_id: versionId }).eq("id", version.process_id);
    return published;
  }
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const fetchNotifications = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const allNotifications = [];
    try {
      const { data: profile } = await supabase.from("profiles").select("role, organization_id").eq("id", session.user.id).single();
      if (profile) {
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const { data: messages } = await supabase.from("system_messages").select("*").eq("status", "active").eq("organization_id", profile.organization_id).or(`start_date.is.null,start_date.lte.${now}`).or(`end_date.is.null,end_date.gte.${now}`).order("created_at", { ascending: false });
        if (messages) {
          const relevant = messages.filter((msg) => {
            if (msg.target_audience === "all") return true;
            const targetIds = Array.isArray(msg.target_ids) ? msg.target_ids : [];
            if (msg.target_audience === "profile") return targetIds.includes(profile.role);
            if (msg.target_audience === "user") return targetIds.includes(session.user.id);
            return false;
          });
          const { data: reads } = await supabase.from("system_message_reads").select("message_id").eq("user_id", session.user.id);
          const readIds = new Set(reads?.map((r) => r.message_id));
          relevant.forEach((msg) => {
            allNotifications.push({
              id: msg.id,
              type: "system_message",
              title: msg.title,
              created_at: msg.created_at,
              read: readIds.has(msg.id),
              data: msg
            });
          });
        }
      }
    } catch (e) {
      console.error("Error fetching messages", e);
    }
    try {
      const approvals = await ProcessService.getPendingApprovals(session.user.id);
      if (approvals) {
        approvals.forEach((app) => {
          allNotifications.push({
            id: app.id,
            type: "process_approval",
            title: `Aprovação Pendente: ${app.version.process.title} (v${app.version.version_number})`,
            created_at: app.created_at,
            read: false,
            // Approvals are always "unread" actions until done
            data: app,
            link: `/processes/${app.version.process.code || app.version.process.id}`
            // Link to viewer
          });
        });
      }
    } catch (e) {
      console.error("Error fetching approvals", e);
    }
    try {
      const { data: alerts } = await supabase.from("in_app_notifications").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(20);
      if (alerts) {
        alerts.forEach((app) => {
          allNotifications.push({
            id: app.id,
            type: "in_app_alert",
            title: app.title,
            created_at: app.created_at,
            read: app.is_read,
            data: app,
            link: app.link
          });
        });
      }
    } catch (e) {
      console.error("Error fetching alerts", e);
    }
    allNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setNotifications(allNotifications);
    setUnreadCount(allNotifications.filter((n) => !n.read).length);
  };
  useEffect(() => {
    fetchNotifications();
    const channel = supabase.channel("public:notifications_bell").on("postgres_changes", { event: "*", schema: "public", table: "system_messages" }, fetchNotifications).on("postgres_changes", { event: "*", schema: "public", table: "system_message_reads" }, fetchNotifications).on("postgres_changes", { event: "*", schema: "public", table: "process_version_approvers" }, fetchNotifications).on("postgres_changes", { event: "*", schema: "public", table: "in_app_notifications" }, fetchNotifications).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const handleNotificationClick = async (notification) => {
    setIsOpen(false);
    if (notification.type === "in_app_alert" && !notification.read) {
      await supabase.from("in_app_notifications").update({ is_read: true }).eq("id", notification.id);
      fetchNotifications();
    }
    if (notification.type === "process_approval" && notification.link) {
      window.location.href = notification.link;
    } else if (notification.type === "in_app_alert" && notification.link) {
      window.location.href = notification.link;
    } else if (notification.type === "system_message") {
      window.dispatchEvent(
        new CustomEvent("open-system-message", {
          detail: { message: notification.data }
        })
      );
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative", ref: dropdownRef, children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setIsOpen(!isOpen),
        className: "p-2 text-gray-500 hover:text-brand hover:bg-gray-50 rounded-full focus:outline-none transition-colors relative",
        children: [
          /* @__PURE__ */ jsx(Bell, { className: "h-6 w-6" }),
          unreadCount > 0 && /* @__PURE__ */ jsx("span", { className: "absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full", children: unreadCount })
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 mt-2 w-96 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in duration-200", children: [
      /* @__PURE__ */ jsxs("div", { className: "px-4 py-2 border-b border-gray-100 bg-gray-50 flex justify-between items-center", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-900", children: "Notificações" }),
        unreadCount > 0 && /* @__PURE__ */ jsxs("span", { className: "text-xs text-brand font-medium", children: [
          unreadCount,
          " novas"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "max-h-96 overflow-y-auto", children: notifications.length > 0 ? notifications.map((notif) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => handleNotificationClick(notif),
          className: `w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors flex gap-3 ${!notif.read ? "bg-blue-50/30" : ""}`,
          children: [
            /* @__PURE__ */ jsx("div", { className: "mt-1 shrink-0", children: notif.type === "process_approval" ? /* @__PURE__ */ jsx(CheckCircle, { className: "h-5 w-5 text-amber-500" }) : /* @__PURE__ */ jsx(Info, { className: "h-5 w-5 text-brand" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: `text-sm font-medium truncate ${!notif.read ? "text-gray-900" : "text-gray-600"}`, children: notif.title }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mt-1", children: [
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-400", children: [
                  new Date(notif.created_at).toLocaleDateString("pt-BR"),
                  " ",
                  new Date(notif.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                ] }),
                !notif.read && /* @__PURE__ */ jsx("span", { className: "text-xs text-brand font-medium", children: notif.type === "process_approval" ? "Revisar" : "Ver" })
              ] })
            ] })
          ]
        },
        notif.id
      )) : /* @__PURE__ */ jsx("div", { className: "px-4 py-6 text-center text-sm text-gray-500", children: "Nenhuma notificação" }) })
    ] })
  ] });
};

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$AppLayout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$AppLayout;
  const {
    title,
    disableNav = false,
    showAuthButtons = false,
    fullWidth = false,
    authOnlyNav = false,
    hideSidebar = false,
    rawSidebar = false
  } = Astro2.props;
  return renderTemplate(_a || (_a = __template(['<html lang="pt-BR"> <head><meta charset="UTF-8"><meta name="description" content="SaaS B2B Platform"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"', "><title>", " | Gerenciar B2B</title>", '</head> <body class="bg-surface text-text-primary h-screen flex flex-col overflow-hidden"> <!-- 1. Global Header --> <header class="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm relative"> <div class="flex items-center gap-8"> <a href="/" class="text-xl font-semibold text-brand tracking-tight flex items-center gap-2" id="global-brand-logo"> <span>🔷</span> <span id="org-name-header">Gerenciar</span> </a> <!-- Module Navigation --> ', ' </div> <div class="flex items-center gap-4"> <!-- Guest Nav (Login/Register) --> ', ' <!-- User Info (Hidden by default, shown via JS) --> <div id="user-info" class="relative flex items-center gap-3" style="display: none;"> ', ' <div class="relative"> <button id="user-menu-button" class="flex items-center gap-3 p-1 rounded-full hover:bg-gray-50 transition-colors focus:outline-none"> <span id="org-name" class="text-sm font-medium text-text-secondary hidden md:block">Empresa</span> <div id="user-avatar" class="h-8 w-8 rounded-full bg-brand-light text-brand font-bold flex items-center justify-center text-xs ring-2 ring-white shadow-sm">\nU\n</div> </button> <!-- Dropdown Menu --> <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transform origin-top-right transition-all duration-200" role="menu"> <div class="px-4 py-3 border-b border-gray-100"> <p class="text-xs text-text-secondary uppercase tracking-wider font-semibold">\nLogado como\n</p> <p id="user-email" class="text-sm font-medium text-text-primary truncate mt-1">\n...\n</p> </div> <div class="py-1 border-b border-gray-100"> <button id="profile-button" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand flex items-center gap-2 transition-colors" role="menuitem"> <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path> </svg>\nEditar Perfil\n</button> <button id="password-button" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand flex items-center gap-2 transition-colors" role="menuitem"> <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path> </svg>\nAlterar Senha\n</button> </div> <div class="py-1"> <button id="logout-button" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand flex items-center gap-2 transition-colors" role="menuitem"> <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path> </svg>\nSair\n</button> </div> </div> </div> </div> </div> </header> <!-- Synchronous script to prevent FOUC (Flash of Unstyled Content) --> <script>\n      try {\n        const isPublicPage = ["/login", "/register", "/", "/forgot-password", "/update-password"].includes(\n          window.location.pathname,\n        );\n        if (isPublicPage) {\n          localStorage.removeItem("tenantContext");\n        } else {\n          const tenantStr = localStorage.getItem("tenantContext");\n          if (tenantStr) {\n            const tenant = JSON.parse(tenantStr);\n\n            if (tenant.color) {\n              document.documentElement.style.setProperty(\n                "--color-brand",\n                tenant.color,\n              );\n            }\n\n            if (tenant.name) {\n              const orgNameEl = document.getElementById("org-name");\n              if (orgNameEl) orgNameEl.textContent = tenant.name;\n            }\n\n            const brandContainer = document.getElementById("global-brand-logo");\n            if (brandContainer) {\n              if (tenant.logo) {\n                brandContainer.innerHTML = `<img src="${tenant.logo}" alt="${tenant.name || ""}" class="h-8 w-auto object-contain" />`;\n              } else if (tenant.name) {\n                brandContainer.innerHTML = `<span>🔷</span><span id="org-name-header">${tenant.name}</span>`;\n              }\n            }\n          }\n        }\n      } catch (e) {}\n    <\/script> <div class="flex flex-1 overflow-hidden"> <!-- 2. Context Sidebar --> <!-- 2. Context Sidebar --> ', " <!-- 3. Main Content --> <main", "> <div", "> ", " </div> </main> </div> <!-- Modals and Floating Elements --> ", " ", " ", " ", " </body> </html>"], ['<html lang="pt-BR"> <head><meta charset="UTF-8"><meta name="description" content="SaaS B2B Platform"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"', "><title>", " | Gerenciar B2B</title>", '</head> <body class="bg-surface text-text-primary h-screen flex flex-col overflow-hidden"> <!-- 1. Global Header --> <header class="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm relative"> <div class="flex items-center gap-8"> <a href="/" class="text-xl font-semibold text-brand tracking-tight flex items-center gap-2" id="global-brand-logo"> <span>🔷</span> <span id="org-name-header">Gerenciar</span> </a> <!-- Module Navigation --> ', ' </div> <div class="flex items-center gap-4"> <!-- Guest Nav (Login/Register) --> ', ' <!-- User Info (Hidden by default, shown via JS) --> <div id="user-info" class="relative flex items-center gap-3" style="display: none;"> ', ' <div class="relative"> <button id="user-menu-button" class="flex items-center gap-3 p-1 rounded-full hover:bg-gray-50 transition-colors focus:outline-none"> <span id="org-name" class="text-sm font-medium text-text-secondary hidden md:block">Empresa</span> <div id="user-avatar" class="h-8 w-8 rounded-full bg-brand-light text-brand font-bold flex items-center justify-center text-xs ring-2 ring-white shadow-sm">\nU\n</div> </button> <!-- Dropdown Menu --> <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transform origin-top-right transition-all duration-200" role="menu"> <div class="px-4 py-3 border-b border-gray-100"> <p class="text-xs text-text-secondary uppercase tracking-wider font-semibold">\nLogado como\n</p> <p id="user-email" class="text-sm font-medium text-text-primary truncate mt-1">\n...\n</p> </div> <div class="py-1 border-b border-gray-100"> <button id="profile-button" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand flex items-center gap-2 transition-colors" role="menuitem"> <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path> </svg>\nEditar Perfil\n</button> <button id="password-button" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand flex items-center gap-2 transition-colors" role="menuitem"> <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path> </svg>\nAlterar Senha\n</button> </div> <div class="py-1"> <button id="logout-button" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand flex items-center gap-2 transition-colors" role="menuitem"> <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path> </svg>\nSair\n</button> </div> </div> </div> </div> </div> </header> <!-- Synchronous script to prevent FOUC (Flash of Unstyled Content) --> <script>\n      try {\n        const isPublicPage = ["/login", "/register", "/", "/forgot-password", "/update-password"].includes(\n          window.location.pathname,\n        );\n        if (isPublicPage) {\n          localStorage.removeItem("tenantContext");\n        } else {\n          const tenantStr = localStorage.getItem("tenantContext");\n          if (tenantStr) {\n            const tenant = JSON.parse(tenantStr);\n\n            if (tenant.color) {\n              document.documentElement.style.setProperty(\n                "--color-brand",\n                tenant.color,\n              );\n            }\n\n            if (tenant.name) {\n              const orgNameEl = document.getElementById("org-name");\n              if (orgNameEl) orgNameEl.textContent = tenant.name;\n            }\n\n            const brandContainer = document.getElementById("global-brand-logo");\n            if (brandContainer) {\n              if (tenant.logo) {\n                brandContainer.innerHTML = \\`<img src="\\${tenant.logo}" alt="\\${tenant.name || ""}" class="h-8 w-auto object-contain" />\\`;\n              } else if (tenant.name) {\n                brandContainer.innerHTML = \\`<span>🔷</span><span id="org-name-header">\\${tenant.name}</span>\\`;\n              }\n            }\n          }\n        }\n      } catch (e) {}\n    <\/script> <div class="flex flex-1 overflow-hidden"> <!-- 2. Context Sidebar --> <!-- 2. Context Sidebar --> ', " <!-- 3. Main Content --> <main", "> <div", "> ", " </div> </main> </div> <!-- Modals and Floating Elements --> ", " ", " ", " ", " </body> </html>"])), addAttribute(Astro2.generator, "content"), title, renderHead(), !disableNav && renderTemplate`<nav id="module-nav" class="hidden md:flex gap-6"${addAttribute(authOnlyNav, "data-auth-only")}${addAttribute(authOnlyNav ? "display: none;" : "", "style")}> <a id="nav-dashboards" href="/dashboard" class="text-sm font-medium text-text-primary hover:text-brand border-b-2 border-transparent hover:border-brand py-4 transition-colors" title="Visão Geral">
Dashboards
</a> <a id="nav-users" href="/users" class="text-sm font-medium text-text-secondary hover:text-brand border-b-2 border-transparent hover:border-brand py-4 transition-colors" title="Gestão de Acessos">
Usuários
</a> <a id="nav-indicators" href="/indicators" class="text-sm font-medium text-text-primary hover:text-brand border-b-2 border-transparent hover:border-brand py-4 transition-colors" title="Acompanhamento de Metas">
Indicadores
</a> <a id="nav-processes" href="/processes" class="text-sm font-medium text-text-primary hover:text-brand border-b-2 border-transparent hover:border-brand py-4 transition-colors" title="Gestão de Processos">
Processos
</a> <a id="nav-settings" href="/admin/settings" class="text-sm font-medium text-text-primary hover:text-brand border-b-2 border-transparent hover:border-brand py-4 transition-colors" title="Configurações do Sistema" style="display: none;">
Configuração
</a> </nav>`, showAuthButtons && renderTemplate`<div id="guest-buttons" class="flex items-center gap-3"> <a href="/login" class="hidden md:inline-flex text-sm font-semibold text-brand hover:underline px-3 py-2">
Entrar
</a> <a href="/register" class="inline-flex items-center justify-center rounded-md text-sm font-semibold bg-brand text-white hover:bg-brand-dark px-4 py-2 shadow-sm transition-colors">
Criar conta
</a> </div>`, renderComponent($$result, "NotificationBell", NotificationBell, { "client:idle": true, "client:component-hydration": "idle", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/components/NotificationBell", "client:component-export": "NotificationBell" }), !disableNav && !hideSidebar && rawSidebar ? renderTemplate`${renderSlot($$result, $$slots["sidebar"])}` : !disableNav && !hideSidebar && renderTemplate`<aside class="w-64 bg-gray-50/50 border-r border-gray-200 flex flex-col shrink-0"> <div class="p-4 h-full flex flex-col"> ${renderSlot($$result, $$slots["sidebar"], renderTemplate` <p class="text-xs text-text-secondary px-2">Menu Principal</p> `)} </div> </aside>`, addAttribute(`flex-1 overflow-auto bg-surface ${fullWidth ? "p-0" : "p-6 md:p-8"}`, "class"), addAttribute(`${fullWidth ? "h-full flex flex-col" : "max-w-7xl mx-auto h-full flex flex-col"}`, "class"), renderSlot($$result, $$slots["default"]), renderComponent($$result, "ProfileModal", ProfileModal, { "client:idle": true, "client:component-hydration": "idle", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/components/ProfileModal", "client:component-export": "default" }), renderComponent($$result, "SystemMessageManager", SystemMessageManager, { "client:idle": true, "client:component-hydration": "idle", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/components/SystemMessageManager", "client:component-export": "SystemMessageManager" }), renderComponent($$result, "HelpDeskWidget", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/components/HelpDeskWidget", "client:component-export": "HelpDeskWidget" }), renderScript($$result, "D:/OneDrive/TatuTec/gerenciar/src/layouts/AppLayout.astro?astro&type=script&index=0&lang.ts"));
}, "D:/OneDrive/TatuTec/gerenciar/src/layouts/AppLayout.astro", void 0);

export { $$AppLayout as $, ProcessService as P, renderScript as r };
