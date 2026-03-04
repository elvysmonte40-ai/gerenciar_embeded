import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

export function TenantIdentityForm() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [logoUrl, setLogoUrl] = useState<string>("");
    const [accentColor, setAccentColor] = useState<string>("#0078D4");
    const [timezone, setTimezone] = useState<string>("America/Sao_Paulo");
    const [orgId, setOrgId] = useState<string | null>(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data: profile } = await supabase
                .from("profiles")
                .select("organization_id")
                .eq("id", session.user.id)
                .single();

            if (profile?.organization_id) {
                setOrgId(profile.organization_id);

                const { data: org } = await supabase
                    .from("organizations")
                    .select("logo_url, accent_color, timezone")
                    .eq("id", profile.organization_id)
                    .single();

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

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploadingLogo(true);
            setFeedback(null);

            if (!event.target.files || event.target.files.length === 0) {
                return;
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${orgId}-${Math.random()}.${fileExt}`;
            const filePath = `logos/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('tenant_assets')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from('tenant_assets').getPublicUrl(filePath);
            setLogoUrl(data.publicUrl);

        } catch (error: any) {
            setFeedback({ type: 'error', text: `Erro no upload: ${error.message}` });
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orgId) return;

        setIsSaving(true);
        setFeedback(null);

        try {
            const { error } = await supabase
                .from('organizations')
                .update({
                    logo_url: logoUrl,
                    accent_color: accentColor,
                    timezone: timezone
                })
                .eq('id', orgId);

            if (error) throw error;

            setFeedback({ type: 'success', text: 'Identidade visual atualizada com sucesso!' });

            // Reload page or broadcast event to update layout
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error: any) {
            setFeedback({ type: 'error', text: `Erro ao salvar: ${error.message}` });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-6 text-sm text-gray-500">Carregando configurações...</div>;

    return (
        <form onSubmit={handleSave} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Logo Upload */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Logo da Empresa</label>
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-32 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                            ) : (
                                <span className="text-xs text-gray-400">Sem Logo</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <label className="relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand inline-block">
                                <span>{uploadingLogo ? 'Enviando...' : 'Alterar Logo'}</span>
                                <input id="logo_upload" name="logo_upload" type="file" className="sr-only" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} />
                            </label>
                            <p className="mt-1 text-xs text-text-tertiary">PNG, JPG ou SVG até 2MB.</p>
                        </div>
                    </div>
                </div>

                {/* Accent Color */}
                <div>
                    <label htmlFor="accent_color" className="block text-sm font-medium text-text-secondary">Cor Secundária (Accent)</label>
                    <div className="mt-2 flex items-center gap-3">
                        <input
                            type="color"
                            id="accent_color"
                            name="accent_color"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="h-9 w-14 p-1 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                            type="text"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm px-3 py-2 border max-w-[150px]"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                        />
                    </div>
                </div>

                {/* Timezone */}
                <div className="sm:col-span-2">
                    <label htmlFor="timezone" className="block text-sm font-medium text-text-secondary">Fuso Horário Padrão</label>
                    <select
                        id="timezone"
                        name="timezone"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm px-3 py-2 border max-w-sm"
                    >
                        <option value="America/Sao_Paulo">América / São Paulo (Brasília)</option>
                        <option value="America/Manaus">América / Manaus</option>
                        <option value="America/Belem">América / Belém</option>
                        <option value="America/Fortaleza">América / Fortaleza</option>
                        <option value="America/Rio_Branco">América / Rio Branco</option>
                    </select>
                </div>
            </div>

            <div className="pt-4 flex items-center justify-end border-t border-gray-100">
                {feedback && (
                    <div className={`mr-4 text-sm font-medium ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {feedback.text}
                    </div>
                )}
                <button
                    type="submit"
                    disabled={isSaving || uploadingLogo}
                    className="inline-flex justify-center rounded-md border border-transparent bg-brand py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                    {isSaving ? 'Salvando...' : 'Salvar Identidade'}
                </button>
            </div>
        </form>
    );
}
