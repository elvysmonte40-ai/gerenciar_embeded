import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_CyO4XxjQ.mjs';
import { $ as $$AppLayout } from './AppLayout_9RuWQQJO.mjs';
import { $ as $$AdminSidebar } from './AdminSidebar_CvKCxhaq.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { s as supabase } from './supabase_C4p1dVZL.mjs';

function TenantIdentityForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [accentColor, setAccentColor] = useState("#0078D4");
  const [timezone, setTimezone] = useState("America/Sao_Paulo");
  const [orgId, setOrgId] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", session.user.id).single();
      if (profile?.organization_id) {
        setOrgId(profile.organization_id);
        const { data: org } = await supabase.from("organizations").select("logo_url, accent_color, timezone").eq("id", profile.organization_id).single();
        if (org) {
          if (org.logo_url) setLogoUrl(org.logo_url);
          if (org.accent_color) setAccentColor(org.accent_color);
          if (org.timezone) setTimezone(org.timezone);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  const handleLogoUpload = async (event) => {
    try {
      setUploadingLogo(true);
      setFeedback(null);
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${orgId}-${Math.random()}.${fileExt}`;
      const filePath = `logos/${fileName}`;
      const { error: uploadError } = await supabase.storage.from("tenant_assets").upload(filePath, file);
      if (uploadError) {
        throw uploadError;
      }
      const { data } = supabase.storage.from("tenant_assets").getPublicUrl(filePath);
      setLogoUrl(data.publicUrl);
    } catch (error) {
      setFeedback({ type: "error", text: `Erro no upload: ${error.message}` });
    } finally {
      setUploadingLogo(false);
    }
  };
  const handleSave = async (e) => {
    e.preventDefault();
    if (!orgId) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      const { error } = await supabase.from("organizations").update({
        logo_url: logoUrl,
        accent_color: accentColor,
        timezone
      }).eq("id", orgId);
      if (error) throw error;
      setFeedback({ type: "success", text: "Identidade visual atualizada com sucesso!" });
      setTimeout(() => {
        window.location.reload();
      }, 1e3);
    } catch (error) {
      setFeedback({ type: "error", text: `Erro ao salvar: ${error.message}` });
    } finally {
      setIsSaving(false);
    }
  };
  if (isLoading) return /* @__PURE__ */ jsx("div", { className: "p-6 text-sm text-gray-500", children: "Carregando configurações..." });
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSave, className: "p-6 space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-6 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-text-secondary mb-2", children: "Logo da Empresa" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: "h-16 w-32 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden shrink-0", children: logoUrl ? /* @__PURE__ */ jsx("img", { src: logoUrl, alt: "Logo", className: "max-h-full max-w-full object-contain" }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400", children: "Sem Logo" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxs("label", { className: "relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand inline-block", children: [
              /* @__PURE__ */ jsx("span", { children: uploadingLogo ? "Enviando..." : "Alterar Logo" }),
              /* @__PURE__ */ jsx("input", { id: "logo_upload", name: "logo_upload", type: "file", className: "sr-only", accept: "image/*", onChange: handleLogoUpload, disabled: uploadingLogo })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-text-tertiary", children: "PNG, JPG ou SVG até 2MB." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "accent_color", className: "block text-sm font-medium text-text-secondary", children: "Cor Secundária (Accent)" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "color",
              id: "accent_color",
              name: "accent_color",
              value: accentColor,
              onChange: (e) => setAccentColor(e.target.value),
              className: "h-9 w-14 p-1 rounded border border-gray-300 cursor-pointer"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm px-3 py-2 border max-w-[150px]",
              value: accentColor,
              onChange: (e) => setAccentColor(e.target.value)
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "timezone", className: "block text-sm font-medium text-text-secondary", children: "Fuso Horário Padrão" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            id: "timezone",
            name: "timezone",
            value: timezone,
            onChange: (e) => setTimezone(e.target.value),
            className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm px-3 py-2 border max-w-sm",
            children: [
              /* @__PURE__ */ jsx("option", { value: "America/Sao_Paulo", children: "América / São Paulo (Brasília)" }),
              /* @__PURE__ */ jsx("option", { value: "America/Manaus", children: "América / Manaus" }),
              /* @__PURE__ */ jsx("option", { value: "America/Belem", children: "América / Belém" }),
              /* @__PURE__ */ jsx("option", { value: "America/Fortaleza", children: "América / Fortaleza" }),
              /* @__PURE__ */ jsx("option", { value: "America/Rio_Branco", children: "América / Rio Branco" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "pt-4 flex items-center justify-end border-t border-gray-100", children: [
      feedback && /* @__PURE__ */ jsx("div", { className: `mr-4 text-sm font-medium ${feedback.type === "success" ? "text-green-600" : "text-red-600"}`, children: feedback.text }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: isSaving || uploadingLogo,
          className: "inline-flex justify-center rounded-md border border-transparent bg-brand py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 transition-colors disabled:opacity-50",
          children: isSaving ? "Salvando..." : "Salvar Identidade"
        }
      )
    ] })
  ] });
}

function CompanyDetailsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    segment: "",
    billing_email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postal_code: ""
  });
  useEffect(() => {
    loadCompanyData();
  }, []);
  const loadCompanyData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", session.user.id).single();
      if (profile?.organization_id) {
        const { data: org, error } = await supabase.from("organizations").select("name, cnpj, segment, billing_email, phone, address, city, state, postal_code").eq("id", profile.organization_id).single();
        if (error) throw error;
        if (org) {
          setFormData({
            name: org.name || "",
            cnpj: org.cnpj || "",
            segment: org.segment || "",
            billing_email: org.billing_email || "",
            phone: org.phone || "",
            address: org.address || "",
            city: org.city || "",
            state: org.state || "",
            postal_code: org.postal_code || ""
          });
        }
      }
    } catch (error) {
      console.error("Error loading company data:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");
      const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", session.user.id).single();
      if (!profile?.organization_id) throw new Error("Sem organização associada");
      const { error } = await supabase.from("organizations").update({
        name: formData.name,
        cnpj: formData.cnpj,
        segment: formData.segment,
        billing_email: formData.billing_email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code
      }).eq("id", profile.organization_id);
      if (error) throw error;
      setMessage({ text: "Dados atualizados com sucesso.", type: "success" });
      window.dispatchEvent(new Event("profile-updated"));
    } catch (error) {
      console.error("Error saving company data:", error);
      setMessage({ text: `Erro ao salvar: ${error.message}`, type: "error" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 5e3);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "p-6 text-center text-gray-500", children: "Carregando dados da empresa..." });
  }
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-6", children: [
    message.text && /* @__PURE__ */ jsx("div", { className: `p-4 rounded-md text-sm ${message.type === "success" ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"} border`, children: message.text }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "sm:col-span-4", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700", children: "Nome Fantasia / Razão Social" }),
        /* @__PURE__ */ jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "name",
            id: "name",
            required: true,
            value: formData.name,
            onChange: handleChange,
            className: "shadow-sm focus:ring-brand focus:border-brand block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "cnpj", className: "block text-sm font-medium text-gray-700", children: "CNPJ" }),
        /* @__PURE__ */ jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "cnpj",
            id: "cnpj",
            value: formData.cnpj,
            onChange: handleChange,
            placeholder: "00.000.000/0000-00",
            className: "shadow-sm focus:ring-brand focus:border-brand block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "sm:col-span-3", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "segment", className: "block text-sm font-medium text-gray-700", children: "Segmento de Atuação" }),
        /* @__PURE__ */ jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "segment",
            id: "segment",
            value: formData.segment,
            onChange: handleChange,
            className: "shadow-sm focus:ring-brand focus:border-brand block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "sm:col-span-3", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "billing_email", className: "block text-sm font-medium text-gray-700", children: "E-mail (Cobranças/Contato)" }),
        /* @__PURE__ */ jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsx(
          "input",
          {
            type: "email",
            name: "billing_email",
            id: "billing_email",
            value: formData.billing_email,
            onChange: handleChange,
            placeholder: "financeiro@empresa.com",
            className: "shadow-sm focus:ring-brand focus:border-brand block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "sm:col-span-3", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "phone", className: "block text-sm font-medium text-gray-700", children: "Telefone" }),
        /* @__PURE__ */ jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "phone",
            id: "phone",
            value: formData.phone,
            onChange: handleChange,
            className: "shadow-sm focus:ring-brand focus:border-brand block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "sm:col-span-6", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "address", className: "block text-sm font-medium text-gray-700", children: "Endereço Completo" }),
        /* @__PURE__ */ jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "address",
            id: "address",
            value: formData.address,
            onChange: handleChange,
            className: "shadow-sm focus:ring-brand focus:border-brand block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "city", className: "block text-sm font-medium text-gray-700", children: "Cidade" }),
        /* @__PURE__ */ jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "city",
            id: "city",
            value: formData.city,
            onChange: handleChange,
            className: "shadow-sm focus:ring-brand focus:border-brand block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "state", className: "block text-sm font-medium text-gray-700", children: "Estado" }),
        /* @__PURE__ */ jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "state",
            id: "state",
            value: formData.state,
            onChange: handleChange,
            className: "shadow-sm focus:ring-brand focus:border-brand block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "postal_code", className: "block text-sm font-medium text-gray-700", children: "CEP" }),
        /* @__PURE__ */ jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "postal_code",
            id: "postal_code",
            value: formData.postal_code,
            onChange: handleChange,
            className: "shadow-sm focus:ring-brand focus:border-brand block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "pt-4 border-t border-gray-200 flex justify-end", children: /* @__PURE__ */ jsx(
      "button",
      {
        type: "submit",
        disabled: saving,
        className: "inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50",
        children: saving ? "Salvando..." : "Salvar Dados Cadastrais"
      }
    ) })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Configurações da Empresa" }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="max-w-4xl mx-auto space-y-8 pb-10"> <!-- Cabeçalho --> <div> <h1 class="text-2xl font-bold text-gray-900">
Configurações da Empresa
</h1> <p class="mt-1 text-sm text-gray-500">
Gerencie as informações cadastrais e a identidade visual da sua
                organização.
</p> </div> <!-- Dados Cadastrais Form --> <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6"> <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center"> <div> <h2 class="text-base font-semibold text-text-primary flex items-center gap-2"> <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z"></path> </svg>
Dados Cadastrais
</h2> <p class="text-xs text-text-secondary mt-1">
Informações legais e de contato da sua empresa.
</p> </div> </div> ${renderComponent($$result2, "CompanyDetailsForm", CompanyDetailsForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/modules/admin/components/CompanyDetailsForm", "client:component-export": "CompanyDetailsForm" })} </div> <!-- Identity Settings Form --> <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"> <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center"> <div> <h2 class="text-base font-semibold text-text-primary flex items-center gap-2"> <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg>
Identidade Visual
</h2> <p class="text-xs text-text-secondary mt-1">
Configure a logo da empresa, cores e opções de fuso
                        horário padrão.
</p> </div> </div> ${renderComponent($$result2, "TenantIdentityForm", TenantIdentityForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/modules/admin/components/TenantIdentityForm", "client:component-export": "TenantIdentityForm" })} </div> </div> `, "sidebar": ($$result2) => renderTemplate`${renderComponent($$result2, "AdminSidebar", $$AdminSidebar, { "slot": "sidebar" })}` })}`;
}, "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/company/index.astro", void 0);

const $$file = "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/company/index.astro";
const $$url = "/admin/company";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
