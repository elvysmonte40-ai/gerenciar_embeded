import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_CyO4XxjQ.mjs';
import { $ as $$AppLayout } from './AppLayout_9RuWQQJO.mjs';
import { $ as $$AdminSidebar } from './AdminSidebar_CvKCxhaq.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { s as supabase } from './supabase_C4p1dVZL.mjs';
import { createPortal } from 'react-dom';
import { A as AVAILABLE_ICONS, M as MenuIcon } from './MenuIcon_Dukt1qPH.mjs';

function MenuForm({ menu, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState("");
  const [iconName, setIconName] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);
  const [useCustomImage, setUseCustomImage] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  useEffect(() => {
    if (isOpen) {
      if (menu) {
        setTitle(menu.title);
        setOrderIndex(menu.order_index);
        if (menu.icon_url) {
          setUseCustomImage(true);
          setPreviewUrl(menu.icon_url);
          setIconName("");
        } else {
          setUseCustomImage(false);
          setIconName(menu.icon_name || AVAILABLE_ICONS[0]);
          setPreviewUrl(null);
        }
      } else {
        setTitle("");
        setOrderIndex(0);
        setUseCustomImage(false);
        setIconName(AVAILABLE_ICONS[0]);
        setPreviewUrl(null);
      }
      setImageFile(null);
      setError(null);
    }
  }, [isOpen, menu]);
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
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
      let finalIconUrl = menu?.icon_url || null;
      let finalIconName = useCustomImage ? null : iconName;
      if (useCustomImage && imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${profile.organization_id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("menu-icons").upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("menu-icons").getPublicUrl(fileName);
        finalIconUrl = publicUrl;
      } else if (!useCustomImage) {
        finalIconUrl = null;
      }
      const payload = {
        organization_id: profile.organization_id,
        title,
        icon_name: finalIconName,
        icon_url: finalIconUrl,
        order_index: orderIndex,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      let queryError;
      if (menu?.id) {
        const { error: error2 } = await supabase.from("organization_menus").update(payload).eq("id", menu.id);
        queryError = error2;
      } else {
        const { error: error2 } = await supabase.from("organization_menus").insert(payload);
        queryError = error2;
      }
      if (queryError) throw queryError;
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving menu:", err);
      setError(err.message || "Erro ao salvar menu");
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
          /* @__PURE__ */ jsx("h3", { className: "text-lg leading-6 font-medium text-gray-900", id: "modal-title", children: menu ? "Editar Menu" : "Novo Menu" }),
          /* @__PURE__ */ jsxs("form", { id: "menu-form", onSubmit: handleSubmit, className: "mt-4 space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "title", className: "block text-sm font-medium text-gray-700", children: "Título" }),
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
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "orderIndex", className: "block text-sm font-medium text-gray-700", children: "Ordem" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  id: "orderIndex",
                  required: true,
                  className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
                  value: orderIndex,
                  onChange: (e) => setOrderIndex(Number(e.target.value))
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Ícone" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4 mb-3", children: [
                /* @__PURE__ */ jsxs("label", { className: "inline-flex items-center", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "radio",
                      className: "form-radio text-brand",
                      name: "iconType",
                      checked: !useCustomImage,
                      onChange: () => setUseCustomImage(false)
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Biblioteca Lucide" })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "inline-flex items-center", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "radio",
                      className: "form-radio text-brand",
                      name: "iconType",
                      checked: useCustomImage,
                      onChange: () => setUseCustomImage(true)
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Imagem Personalizada" })
                ] })
              ] }),
              !useCustomImage ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-5 gap-2 border p-2 rounded-md", children: AVAILABLE_ICONS.map((icon) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: `flex flex-col items-center justify-center p-2 rounded cursor-pointer hover:bg-gray-100 ${iconName === icon ? "bg-brand/10 border border-brand" : ""}`,
                  onClick: () => setIconName(icon),
                  children: [
                    /* @__PURE__ */ jsx(MenuIcon, { iconName: icon, className: "h-6 w-6 text-gray-600" }),
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] mt-1 truncate w-full text-center", children: icon })
                  ]
                },
                icon
              )) }) : /* @__PURE__ */ jsx("div", { className: "mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md", children: /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-center", children: [
                previewUrl ? /* @__PURE__ */ jsxs("div", { className: "mx-auto h-16 w-16 mb-4 relative group", children: [
                  /* @__PURE__ */ jsx("img", { src: previewUrl, alt: "Preview", className: "h-16 w-16 object-cover rounded-md" }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: (e) => {
                        e.preventDefault();
                        setImageFile(null);
                        setPreviewUrl(null);
                      },
                      className: "absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600",
                      children: /* @__PURE__ */ jsx("svg", { className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
                    }
                  )
                ] }) : /* @__PURE__ */ jsx("svg", { className: "mx-auto h-12 w-12 text-gray-400", stroke: "currentColor", fill: "none", viewBox: "0 0 48 48", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }),
                /* @__PURE__ */ jsx("div", { className: "flex text-sm text-gray-600 justify-center", children: /* @__PURE__ */ jsxs("label", { htmlFor: "file-upload", className: "relative cursor-pointer bg-white rounded-md font-medium text-brand hover:text-brand-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand", children: [
                  /* @__PURE__ */ jsx("span", { children: "Upload um arquivo" }),
                  /* @__PURE__ */ jsx("input", { id: "file-upload", name: "file-upload", type: "file", className: "sr-only", accept: "image/*", onChange: handleFileChange })
                ] }) }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "PNG, JPG até 2MB (1:1)" })
              ] }) })
            ] }),
            error && /* @__PURE__ */ jsx("div", { className: "text-red-600 text-sm", children: error })
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              form: "menu-form",
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

function MenuList() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const fetchMenus = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", session.user.id).single();
      if (!profile?.organization_id) return;
      const { data, error } = await supabase.from("organization_menus").select("*").eq("organization_id", profile.organization_id).order("order_index", { ascending: true });
      if (error) throw error;
      setMenus(data || []);
    } catch (error) {
      console.error("Error fetching menus:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchMenus();
  }, []);
  const handleAdd = () => {
    setEditingMenu(null);
    setIsFormOpen(true);
  };
  const handleEdit = (menu) => {
    setEditingMenu(menu);
    setIsFormOpen(true);
  };
  const handleDelete = async (id, title) => {
    if (!confirm(`Tem certeza que deseja excluir o menu "${title}"?`)) return;
    try {
      const { error } = await supabase.from("organization_menus").delete().eq("id", id);
      if (error) throw error;
      setMenus(menus.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Error deleting menu:", error);
      alert("Erro ao excluir menu");
    }
  };
  const handleToggleStatus = async (menu) => {
    try {
      const newStatus = !menu.is_active;
      const { error } = await supabase.from("organization_menus").update({ is_active: newStatus }).eq("id", menu.id);
      if (error) throw error;
      setMenus(menus.map((m) => m.id === menu.id ? { ...m, is_active: newStatus } : m));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-base font-semibold text-text-primary flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-brand", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z", clipRule: "evenodd" }) }),
            "Gerenciar Menus"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-text-secondary mt-1", children: "Organize a navegação lateral dos seus usuários." })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleAdd,
            className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors",
            children: [
              /* @__PURE__ */ jsx("svg", { className: "-ml-1 mr-2 h-5 w-5", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z", clipRule: "evenodd" }) }),
              "Novo Menu"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: loading ? /* @__PURE__ */ jsx("div", { className: "p-6 text-center text-gray-500 text-sm", children: "Carregando..." }) : menus.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-6 text-center text-gray-500 text-sm", children: 'Nenhum menu cadastrado. Clique em "Novo Menu" para começar.' }) : /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16", children: "Ícone" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Título" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24", children: "Ordem" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24", children: "Status" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "relative px-6 py-3", children: /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Ações" }) })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: menus.map((menu) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50", children: [
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx(MenuIcon, { iconName: menu.icon_name, iconUrl: menu.icon_url }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-text-primary", children: menu.title }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: menu.order_index }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => handleToggleStatus(menu),
              className: `relative inline-flex shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand ${menu.is_active ? "bg-brand" : "bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Use setting" }),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    "aria-hidden": "true",
                    className: `pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${menu.is_active ? "translate-x-5" : "translate-x-0"}`
                  }
                )
              ]
            }
          ) }),
          /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: [
            /* @__PURE__ */ jsx("button", { onClick: () => handleEdit(menu), className: "text-brand hover:text-brand-dark mr-4", children: "Editar" }),
            /* @__PURE__ */ jsx("button", { onClick: () => handleDelete(menu.id, menu.title), className: "text-red-600 hover:text-red-900", children: "Excluir" })
          ] })
        ] }, menu.id)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(
      MenuForm,
      {
        isOpen: isFormOpen,
        onClose: () => setIsFormOpen(false),
        onSuccess: () => {
          fetchMenus();
          setIsFormOpen(false);
        },
        menu: editingMenu
      }
    )
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Gerenciar Menus" }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="px-4 py-6 sm:px-0"> <!-- Menu List Component --> ${renderComponent($$result2, "MenuList", MenuList, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/modules/admin/components/MenuList", "client:component-export": "default" })} </div> `, "sidebar": ($$result2) => renderTemplate`${renderComponent($$result2, "AdminSidebar", $$AdminSidebar, { "slot": "sidebar" })}` })}`;
}, "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/menus/index.astro", void 0);

const $$file = "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/menus/index.astro";
const $$url = "/admin/menus";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
