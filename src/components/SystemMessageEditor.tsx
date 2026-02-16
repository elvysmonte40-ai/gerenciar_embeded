import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
// @ts-ignore
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface Profile {
    id: string;
    full_name: string;
    role: string;
    email: string;
}

interface Props {
    messageId?: string; // Changed from 'message' object
}

export const SystemMessageEditor: React.FC<Props> = ({ messageId }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [roles, setRoles] = useState<string[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [organizationId, setOrganizationId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        status: "draft",
        start_date: "",
        end_date: "",
        target_audience: "all",
        target_ids: [] as string[],
    });

    const isNew = messageId === "new" || !messageId;

    const modules = {
        toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [
                { list: "ordered" },
                { list: "bullet" },
                { indent: "-1" },
                { indent: "+1" },
            ],
            ["link", "image"],
            ["clean"],
        ],
    };

    const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "list",
        "bullet",
        "indent",
        "link",
        "image",
    ];

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    window.location.href = "/login";
                    return;
                }

                // 1. Get User Profile & Org
                const { data: userProfile, error: profileError } = await supabase
                    .from("profiles")
                    .select("role, organization_id")
                    .eq("id", session.user.id)
                    .single();

                if (profileError || !userProfile || userProfile.role !== 'admin') {
                    console.error("Profile error:", profileError);
                    alert("Erro de permissão ou perfil não encontrado.");
                    window.location.href = "/dashboard";
                    return;
                }

                setOrganizationId(userProfile.organization_id);

                // 2. Fetch Profiles for Selector
                const { data: profilesData, error: profilesFetchError } = await supabase
                    .from("profiles")
                    .select("id, full_name, role, email")
                    .eq("organization_id", userProfile.organization_id)
                    .order("full_name");

                if (profilesFetchError) {
                    console.error("Error fetching profiles:", profilesFetchError);
                    setErrorMsg("Erro ao buscar usuários: " + profilesFetchError.message);
                } else if (profilesData) {
                    console.log("Profiles loaded:", profilesData.length);
                    setProfiles(profilesData);
                    const uniqueRoles = [...new Set(profilesData.map((p) => p.role))];
                    setRoles(uniqueRoles);
                }

                // 3. Fetch Message if editing
                if (!isNew && messageId) {
                    const { data: msg, error: msgError } = await supabase
                        .from("system_messages")
                        .select("*")
                        .eq("id", messageId)
                        .eq("organization_id", userProfile.organization_id)
                        .single();

                    if (msgError) throw msgError;
                    if (msg) {
                        setFormData({
                            title: msg.title,
                            content: msg.content,
                            status: msg.status,
                            start_date: msg.start_date ? msg.start_date.split("T")[0] : "",
                            end_date: msg.end_date ? msg.end_date.split("T")[0] : "",
                            target_audience: msg.target_audience,
                            target_ids: msg.target_ids || [],
                        });
                    }
                }

            } catch (err: any) {
                console.error("Error loading data:", err);
                setErrorMsg(err.message);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [messageId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!session || !organizationId) throw new Error("No session or org");

            const payload = {
                organization_id: organizationId,
                title: formData.title,
                content: formData.content,
                status: formData.status,
                type: "popup",
                start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
                end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
                target_audience: formData.target_audience,
                target_ids: formData.target_ids,
                created_by: session.user.id,
            };

            let error;
            if (!isNew && messageId) {
                const { error: updateError } = await supabase
                    .from("system_messages")
                    .update(payload)
                    .eq("id", messageId);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from("system_messages")
                    .insert([payload]);
                error = insertError;
            }

            if (error) throw error;

            window.location.href = "/admin/messages";
        } catch (err: any) {
            console.error("Error saving message:", err);
            const msg = err.message || JSON.stringify(err);
            alert(`Erro ao salvar: ${msg}`);
        } finally {
            setSaving(false);
        }
    };

    const toggleTargetId = (id: string) => {
        setFormData((prev) => {
            const exists = prev.target_ids.includes(id);
            return {
                ...prev,
                target_ids: exists
                    ? prev.target_ids.filter((i: string) => i !== id)
                    : [...prev.target_ids, id],
            };
        });
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Carregando editor...</div>;
    }

    return (
        <form onSubmit={handleSave} className="space-y-6">
            {errorMsg && (
                <div className="bg-red-50 p-4 rounded-md text-red-700 text-sm">
                    {errorMsg}
                </div>
            )}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Title */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-text-secondary">
                        Título
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm px-3 py-2 border"
                    />
                </div>

                {/* Content (Rich Text) */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        Conteúdo da Mensagem
                    </label>
                    <div className="bg-white">
                        <ReactQuill
                            theme="snow"
                            value={formData.content}
                            onChange={(content) =>
                                setFormData({ ...formData, content: content })
                            }
                            modules={modules}
                            formats={formats}
                            className="h-64 mb-12"
                        />
                    </div>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary">
                        Status
                    </label>
                    <select
                        value={formData.status}
                        onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm px-3 py-2 border"
                    >
                        <option value="draft">Rascunho</option>
                        <option value="active">Ativo</option>
                        <option value="archived">Arquivado</option>
                    </select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">
                            Data Início
                        </label>
                        <input
                            type="date"
                            value={formData.start_date}
                            onChange={(e) =>
                                setFormData({ ...formData, start_date: e.target.value })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm px-3 py-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">
                            Data Fim (Opcional)
                        </label>
                        <input
                            type="date"
                            value={formData.end_date}
                            onChange={(e) =>
                                setFormData({ ...formData, end_date: e.target.value })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm px-3 py-2 border"
                        />
                    </div>
                </div>

                {/* Target Audience */}
                <div className="col-span-2 space-y-4 border-t border-gray-100 pt-4">
                    <h3 className="text-lg font-medium text-text-primary">Público Alvo</h3>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">
                            Quem deve ver esta mensagem?
                        </label>
                        <select
                            value={formData.target_audience}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    target_audience: e.target.value,
                                    target_ids: [],
                                });
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm px-3 py-2 border"
                        >
                            <option value="all">Todos os Usuários</option>
                            <option value="profile">Perfis Específicos (Roles)</option>
                            <option value="user">Usuários Específicos</option>
                        </select>
                    </div>

                    {/* Target Selector */}
                    {formData.target_audience === "profile" && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-text-secondary">
                                Selecione os Perfis:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {roles.length === 0 && (
                                    <span className="text-sm text-gray-400">Nenhum perfil encontrado.</span>
                                )}
                                {roles.map((role) => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => toggleTargetId(role)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border ${formData.target_ids.includes(role)
                                            ? "bg-brand text-white border-brand"
                                            : "bg-white text-text-secondary border-gray-300 hover:bg-gray-50"
                                            }`}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {formData.target_audience === "user" && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-text-secondary">
                                Selecione os Usuários:
                            </p>
                            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {profiles.length === 0 && (
                                    <div className="col-span-2 text-center py-4 text-sm text-gray-500">
                                        Nenhum usuário encontrado. (Org: {organizationId})
                                    </div>
                                )}
                                {profiles.map((p) => (
                                    <div key={p.id} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id={`user-${p.id}`}
                                            checked={formData.target_ids.includes(p.id)}
                                            onChange={() => toggleTargetId(p.id)}
                                            className="h-4 w-4 text-brand focus:ring-brand border-gray-300 rounded"
                                        />
                                        <label
                                            htmlFor={`user-${p.id}`}
                                            className="text-sm text-text-secondary truncate cursor-pointer select-none"
                                        >
                                            {p.full_name} ({p.role})
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-5">
                <button
                    type="button"
                    onClick={() => (window.location.href = "/admin/messages")}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-text-secondary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand mr-3"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50"
                >
                    {saving ? "Salvando..." : "Salvar Mensagem"}
                </button>
            </div>
        </form>
    );
};
