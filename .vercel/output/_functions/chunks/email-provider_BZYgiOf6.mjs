import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { r as renderTemplate, l as renderComponent, m as maybeRenderHead } from './entrypoint_CyO4XxjQ.mjs';
import { $ as $$AppLayout } from './AppLayout_9RuWQQJO.mjs';
import { $ as $$AdminSidebar } from './AdminSidebar_CvKCxhaq.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState, useEffect, useRef } from 'react';
import { X, Save, Plus, Mail, Play, Edit } from 'lucide-react';
import { s as supabase } from './supabase_C4p1dVZL.mjs';

function CampaignForm({ campaign, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: campaign?.name || "",
    trigger_event: campaign?.trigger_event || "manual",
    status: campaign?.status || "draft",
    html_content: campaign?.html_content || `<html>
  <head>
    <style>
      body { font-family: sans-serif; }
    </style>
  </head>
  <body>
    <h1>Olá, {{nome}}</h1>
    <p>Sua mensagem aqui...</p>
  </body>
</html>`
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const isEditing = !!campaign?.id;
      const method = isEditing ? "PUT" : "POST";
      const body = isEditing ? { id: campaign.id, ...formData } : formData;
      const res = await fetch("/api/emails/campaigns", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar campanha");
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-b border-gray-200 flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900", children: campaign ? "Editar Campanha" : "Nova Campanha de E-mail" }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-500", children: /* @__PURE__ */ jsx(X, { className: "h-6 w-6" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 overflow-y-auto flex-1", children: [
      error && /* @__PURE__ */ jsx("div", { className: "mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm", children: error }),
      /* @__PURE__ */ jsx("form", { id: "campaign-form", onSubmit: handleSubmit, className: "space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Nome da Campanha (Assunto)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                required: true,
                maxLength: 100,
                value: formData.name,
                onChange: (e) => setFormData({ ...formData, name: e.target.value }),
                className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                placeholder: "Ex: Bem-vindo ao Sistema!"
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: 'Este texto será usado como o "Assunto" do e-mail.' })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Gatilho (Evento)" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: formData.trigger_event,
                onChange: (e) => setFormData({ ...formData, trigger_event: e.target.value }),
                className: "mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "manual", children: "Disparo Manual (em Massa)" }),
                  /* @__PURE__ */ jsx("option", { value: "welcome_email", children: "Novo Usuário (Boas vindas)" }),
                  /* @__PURE__ */ jsx("option", { value: "password_reset", children: "Redefinição de Senha" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Status" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center space-x-4", children: [
              /* @__PURE__ */ jsxs("label", { className: "inline-flex items-center text-sm", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "radio",
                    value: "active",
                    checked: formData.status === "active",
                    onChange: (e) => setFormData({ ...formData, status: e.target.value }),
                    className: "form-radio text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "ml-2 text-gray-700", children: "Ativo" })
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "inline-flex items-center text-sm", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "radio",
                    value: "draft",
                    checked: formData.status === "draft",
                    onChange: (e) => setFormData({ ...formData, status: e.target.value }),
                    className: "form-radio text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "ml-2 text-gray-700", children: "Rascunho" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Conteúdo HTML Personalizado" }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-[300px] relative", children: /* @__PURE__ */ jsx(
            "textarea",
            {
              required: true,
              value: formData.html_content,
              onChange: (e) => setFormData({ ...formData, html_content: e.target.value }),
              className: "absolute inset-0 w-full h-full font-mono text-sm border border-gray-300 rounded-md shadow-sm p-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 resize-none bg-gray-50"
            }
          ) }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-2", children: [
            "Você pode usar variáveis no formato ",
            "{{variavel}}",
            ", por exemplo `",
            "{{nome}}",
            "` ou `",
            "{{link}}",
            "`."
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3 rounded-b-lg", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: onClose,
          className: "px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
          children: "Cancelar"
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "submit",
          form: "campaign-form",
          disabled: loading,
          className: "inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50",
          children: [
            /* @__PURE__ */ jsx(Save, { className: "-ml-1 mr-2 h-4 w-4" }),
            loading ? "Salvando..." : "Salvar Campanha"
          ]
        }
      )
    ] })
  ] }) });
}

function CampaignManager() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [testEmail, setTestEmail] = useState("");
  const [testingId, setTestingId] = useState(null);
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/emails/campaigns");
      if (!res.ok) throw new Error("Falha ao carregar campanhas");
      const data = await res.json();
      setCampaigns(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCampaigns();
  }, []);
  const handleTestSend = async (campaignId) => {
    if (!testEmail) {
      alert("Por favor, digite um e-mail para teste.");
      return;
    }
    try {
      setTestingId(campaignId);
      const res = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          to: testEmail,
          variables: { nome: "Usuário de Teste" }
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Erro ao enviar");
      alert("E-mail de teste enviado com sucesso!");
      setTestEmail("");
    } catch (err) {
      alert(`Erro: ${err.message}`);
    } finally {
      setTestingId(null);
    }
  };
  if (loading) return /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-gray-500", children: "Carregando campanhas..." });
  if (error) return /* @__PURE__ */ jsxs("div", { className: "p-8 text-center text-red-500", children: [
    "Erro: ",
    error
  ] });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-medium text-gray-900", children: "Campanhas de E-mail" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Gerencie templates HTML e ative gatilhos automáticos para envio via Resend." })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => {
            setEditingCampaign(null);
            setIsFormOpen(true);
          },
          className: "inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "-ml-1 mr-2 h-5 w-5" }),
            "Nova Campanha"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-white shadow overflow-hidden sm:rounded-md border border-gray-200", children: /* @__PURE__ */ jsx("ul", { className: "divide-y divide-gray-200", children: campaigns.length === 0 ? /* @__PURE__ */ jsxs("li", { className: "px-6 py-12 text-center text-gray-500", children: [
      /* @__PURE__ */ jsx(Mail, { className: "mx-auto h-12 w-12 text-gray-300 mb-4" }),
      'Nenhuma campanha configurada. Clique em "Nova Campanha" para começar.'
    ] }) : campaigns.map((c) => /* @__PURE__ */ jsx("li", { className: "p-6 hover:bg-gray-50 transition-colors", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-indigo-600 truncate", children: c.name }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center text-sm text-gray-500 space-x-4", children: [
          /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsx("span", { className: `w-2 h-2 rounded-full ${c.status === "active" ? "bg-green-500" : "bg-yellow-400"}` }),
            c.status === "active" ? "Ativo" : "Rascunho"
          ] }),
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Gatilho: ",
            /* @__PURE__ */ jsx("span", { className: "font-mono bg-gray-100 px-1 py-0.5 rounded", children: c.trigger_event })
          ] }),
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Atualizado em ",
            new Date(c.created_at).toLocaleDateString()
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "ml-4 flex items-center space-x-4", children: [
        c.status === "active" && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mr-4 border-r pr-4", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "email",
              placeholder: "E-mail de teste",
              className: "text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500",
              value: testEmail,
              onChange: (e) => setTestEmail(e.target.value)
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleTestSend(c.id),
              disabled: testingId === c.id,
              className: "text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50",
              title: "Enviar teste",
              children: /* @__PURE__ */ jsx(Play, { className: "h-5 w-5" })
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setEditingCampaign(c);
              setIsFormOpen(true);
            },
            className: "text-gray-400 hover:text-indigo-600 transition-colors",
            title: "Editar",
            children: /* @__PURE__ */ jsx(Edit, { className: "h-5 w-5" })
          }
        )
      ] })
    ] }) }, c.id)) }) }),
    isFormOpen && /* @__PURE__ */ jsx(
      CampaignForm,
      {
        campaign: editingCampaign,
        onClose: () => setIsFormOpen(false),
        onSaved: () => {
          setIsFormOpen(false);
          fetchCampaigns();
        }
      }
    )
  ] });
}

function EmailTemplateEditor() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editSubject, setEditSubject] = useState("");
  const [editHtml, setEditHtml] = useState("");
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [message, setMessage] = useState(null);
  const iframeRef = useRef(null);
  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || "";
  };
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch("/api/emails/templates", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Falha ao carregar templates");
      const data = await res.json();
      setTemplates(data);
    } catch (err) {
      showMessage("error", err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTemplates();
  }, []);
  useEffect(() => {
    if (iframeRef.current && editHtml) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(editHtml);
        doc.close();
      }
    }
  }, [editHtml]);
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4e3);
  };
  const selectTemplate = (template) => {
    setSelectedTemplate(template);
    setEditSubject(template.subject);
    setEditHtml(template.html_content);
    setMessage(null);
  };
  const handleSave = async () => {
    if (!selectedTemplate) return;
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/emails/templates", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          template_type: selectedTemplate.template_type,
          subject: editSubject,
          html_content: editHtml
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      showMessage("success", "Template salvo com sucesso!");
      await fetchTemplates();
      setSelectedTemplate((prev) => prev ? { ...prev, is_customized: true } : null);
    } catch (err) {
      showMessage("error", err.message);
    } finally {
      setSaving(false);
    }
  };
  const handleRestore = async () => {
    if (!selectedTemplate) return;
    if (!confirm("Restaurar o template para o padrão? As alterações customizadas serão perdidas.")) return;
    try {
      const token = await getToken();
      const res = await fetch(`/api/emails/templates?template_type=${selectedTemplate.template_type}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Falha ao restaurar");
      showMessage("success", "Template restaurado ao padrão!");
      await fetchTemplates();
      const updated = templates.find((t) => t.template_type === selectedTemplate.template_type);
      if (updated) {
        selectTemplate(updated);
      }
      setSelectedTemplate(null);
    } catch (err) {
      showMessage("error", err.message);
    }
  };
  const handleTestSend = async () => {
    if (!testEmail || !selectedTemplate) return;
    setSendingTest(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/emails/send-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          to: testEmail,
          subject: editSubject,
          htmlContent: editHtml,
          variables: { nome: "Usuário de Teste", reset_url: "#" }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enviar");
      showMessage("success", `Email de teste enviado para ${testEmail}!`);
      setTestEmail("");
    } catch (err) {
      showMessage("error", `Falha no envio: ${err.message}`);
    } finally {
      setSendingTest(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-64", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) });
  }
  if (selectedTemplate) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-4 flex flex-col min-h-full", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSelectedTemplate(null),
              className: "p-2 rounded-lg hover:bg-gray-100 transition-colors",
              children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-gray-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) })
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900", children: selectedTemplate.label }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: selectedTemplate.description })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          selectedTemplate.is_customized && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleRestore,
              className: "px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors",
              children: "Restaurar Padrão"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleSave,
              disabled: saving,
              className: "px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors",
              children: saving ? "Salvando..." : "💾 Salvar Template"
            }
          )
        ] })
      ] }),
      message && /* @__PURE__ */ jsx("div", { className: `px-4 py-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`, children: message.text }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Assunto do Email" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: editSubject,
            onChange: (e) => setEditSubject(e.target.value),
            className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[600px]", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white", children: [
          /* @__PURE__ */ jsxs("div", { className: "px-4 py-2 bg-gray-800 text-gray-300 text-xs font-mono flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { children: "📝 Editor HTML" }),
            /* @__PURE__ */ jsxs("span", { className: "text-gray-500", children: [
              editHtml.length,
              " caracteres"
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: editHtml,
              onChange: (e) => setEditHtml(e.target.value),
              className: "flex-1 p-4 font-mono text-sm text-gray-800 bg-gray-50 resize-none focus:outline-none focus:bg-white transition-colors",
              style: { tabSize: 2, lineHeight: "1.6" },
              spellCheck: false
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white", children: [
          /* @__PURE__ */ jsxs("div", { className: "px-4 py-2 bg-gray-100 text-gray-600 text-xs font-medium flex items-center justify-between border-b border-gray-200", children: [
            /* @__PURE__ */ jsx("span", { children: "👁️ Pré-visualização" }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "Atualização em tempo real" })
          ] }),
          /* @__PURE__ */ jsx(
            "iframe",
            {
              ref: iframeRef,
              sandbox: "allow-same-origin",
              className: "flex-1 w-full bg-white",
              title: "Preview do template",
              style: { minHeight: "400px" }
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-600 whitespace-nowrap", children: "📤 Enviar Teste:" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "email",
            placeholder: "email@exemplo.com",
            value: testEmail,
            onChange: (e) => setTestEmail(e.target.value),
            className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleTestSend,
            disabled: sendingTest || !testEmail,
            className: "px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors whitespace-nowrap",
            children: sendingTest ? "Enviando..." : "Enviar"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-4 bg-amber-50 border border-amber-200 rounded-xl", children: [
        /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-amber-800 mb-2", children: "📌 Variáveis Disponíveis" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-amber-700", children: selectedTemplate.template_type === "welcome" ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("code", { className: "bg-amber-100 px-2 py-1 rounded", children: "{{nome}}" }),
          /* @__PURE__ */ jsx("span", { children: "Nome do usuário" }),
          /* @__PURE__ */ jsx("span", {})
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("code", { className: "bg-amber-100 px-2 py-1 rounded", children: "{{reset_url}}" }),
          /* @__PURE__ */ jsx("span", { children: "Link de redefinição" }),
          /* @__PURE__ */ jsx("span", {})
        ] }) })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Templates do Sistema" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Personalize os templates de email enviados automaticamente pelo sistema." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: templates.map((template) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => selectTemplate(template),
        className: "text-left p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all group",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-3", children: [
            /* @__PURE__ */ jsx("div", { className: "p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors", children: template.template_type === "welcome" ? /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 text-blue-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) : /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 text-blue-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }) }) }),
            template.is_customized && /* @__PURE__ */ jsx("span", { className: "px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full", children: "Customizado" })
          ] }),
          /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors", children: template.label }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mb-3", children: template.description }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-400", children: template.updated_at ? `Atualizado em ${new Date(template.updated_at).toLocaleDateString("pt-BR")}` : "Usando template padrão" })
        ]
      },
      template.template_type
    )) })
  ] });
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$EmailProvider = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template(["", " <script>\n    document.querySelectorAll('.tab-button').forEach(btn => {\n        btn.addEventListener('click', () => {\n            const tab = btn.dataset.tab;\n\n            // Update buttons\n            document.querySelectorAll('.tab-button').forEach(b => {\n                b.classList.remove('border-blue-500', 'text-blue-600');\n                b.classList.add('border-transparent', 'text-gray-500');\n            });\n            btn.classList.remove('border-transparent', 'text-gray-500');\n            btn.classList.add('border-blue-500', 'text-blue-600');\n\n            // Update content\n            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));\n            document.getElementById(`tab-${tab}`)?.classList.remove('hidden');\n        });\n    });\n<\/script>"], ["", " <script>\n    document.querySelectorAll('.tab-button').forEach(btn => {\n        btn.addEventListener('click', () => {\n            const tab = btn.dataset.tab;\n\n            // Update buttons\n            document.querySelectorAll('.tab-button').forEach(b => {\n                b.classList.remove('border-blue-500', 'text-blue-600');\n                b.classList.add('border-transparent', 'text-gray-500');\n            });\n            btn.classList.remove('border-transparent', 'text-gray-500');\n            btn.classList.add('border-blue-500', 'text-blue-600');\n\n            // Update content\n            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));\n            document.getElementById(\\`tab-\\${tab}\\`)?.classList.remove('hidden');\n        });\n    });\n<\/script>"])), renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Provedor de Email", "fullWidth": true }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="w-full max-w-[1600px] mx-auto p-6 md:p-8 flex flex-col h-full"> <div class="w-full"> <!-- Tab Navigation --> <div class="border-b border-gray-200 mb-6"> <nav class="-mb-px flex space-x-8" id="email-tabs"> <button data-tab="templates" class="tab-button border-blue-500 text-blue-600 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors">
📧 Templates do Sistema
</button> <button data-tab="campaigns" class="tab-button border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors">
📨 Campanhas
</button> </nav> </div> <!-- Tab Content --> <div id="tab-templates" class="tab-content flex-1 h-full w-full"> ${renderComponent($$result2, "EmailTemplateEditor", EmailTemplateEditor, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/modules/admin/components/EmailTemplateEditor.tsx", "client:component-export": "default" })} </div> <div id="tab-campaigns" class="tab-content hidden flex-1 h-full w-full"> ${renderComponent($$result2, "CampaignManager", CampaignManager, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/modules/admin/components/CampaignManager.tsx", "client:component-export": "default" })} </div> </div> </div> `, "sidebar": ($$result2) => renderTemplate`${renderComponent($$result2, "AdminSidebar", $$AdminSidebar, { "slot": "sidebar" })}` }));
}, "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/email-provider.astro", void 0);

const $$file = "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/email-provider.astro";
const $$url = "/admin/email-provider";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$EmailProvider,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
