import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface Domain {
    id: string;
    domain: string;
    is_primary: boolean;
    created_at: string;
}

export function CorporateDomainsForm() {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newDomain, setNewDomain] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [orgId, setOrgId] = useState<string | null>(null);

    useEffect(() => {
        loadDomains();
    }, []);

    const loadDomains = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', session.user.id)
                .single();

            if (!profile?.organization_id) return;
            setOrgId(profile.organization_id);

            const { data, error } = await supabase
                .from('organization_domains')
                .select('*')
                .eq('organization_id', profile.organization_id)
                .order('is_primary', { ascending: false })
                .order('created_at', { ascending: true });

            if (error) throw error;
            setDomains(data || []);
        } catch (err) {
            console.error('Error loading domains:', err);
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (text: string, type: 'success' | 'error') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    const addDomain = async () => {
        if (!orgId || !newDomain.trim()) return;

        const cleanDomain = newDomain.trim().toLowerCase().replace(/^@/, '');

        const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;
        if (!domainRegex.test(cleanDomain)) {
            showMessage('Formato inválido. Use: empresa.com.br', 'error');
            return;
        }

        if (domains.some(d => d.domain === cleanDomain)) {
            showMessage('Este domínio já está cadastrado.', 'error');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('organization_domains')
                .insert({
                    organization_id: orgId,
                    domain: cleanDomain,
                    is_primary: domains.length === 0,
                });

            if (error) throw error;
            setNewDomain('');
            showMessage('Domínio adicionado com sucesso.', 'success');
            loadDomains();
        } catch (err: any) {
            showMessage(`Erro: ${err.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    const removeDomain = async (id: string) => {
        if (!confirm('Remover este domínio corporativo?')) return;

        try {
            const { error } = await supabase
                .from('organization_domains')
                .delete()
                .eq('id', id);

            if (error) throw error;
            showMessage('Domínio removido.', 'success');
            loadDomains();
        } catch (err: any) {
            showMessage(`Erro: ${err.message}`, 'error');
        }
    };

    const setPrimary = async (id: string) => {
        if (!orgId) return;

        try {
            // Remove primary from all
            await supabase
                .from('organization_domains')
                .update({ is_primary: false })
                .eq('organization_id', orgId);

            // Set new primary
            const { error } = await supabase
                .from('organization_domains')
                .update({ is_primary: true })
                .eq('id', id);

            if (error) throw error;
            showMessage('Domínio primário atualizado.', 'success');
            loadDomains();
        } catch (err: any) {
            showMessage(`Erro: ${err.message}`, 'error');
        }
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Carregando domínios...</div>;
    }

    return (
        <div className="p-6 space-y-5">
            {message.text && (
                <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'} border`}>
                    {message.text}
                </div>
            )}

            <p className="text-sm text-gray-500">
                Cadastre os domínios de e-mail corporativo da sua empresa. Eles serão usados para monitorar quais usuários
                possuem e-mails fora do padrão corporativo no painel de auditoria.
            </p>

            {/* Add domain */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                    <input
                        type="text"
                        value={newDomain}
                        onChange={e => setNewDomain(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDomain())}
                        placeholder="empresa.com.br"
                        className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand focus:border-brand"
                    />
                </div>
                <button
                    onClick={addDomain}
                    disabled={saving || !newDomain.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-brand hover:bg-brand-dark rounded-md disabled:opacity-50 transition-colors"
                >
                    {saving ? 'Salvando...' : 'Adicionar'}
                </button>
            </div>

            {/* Domain list */}
            {domains.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
                    Nenhum domínio corporativo cadastrado.
                </div>
            ) : (
                <div className="space-y-2">
                    {domains.map(domain => (
                        <div
                            key={domain.id}
                            className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-800">@{domain.domain}</span>
                                {domain.is_primary && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand/10 text-brand uppercase tracking-wider">
                                        Primário
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {!domain.is_primary && (
                                    <button
                                        onClick={() => setPrimary(domain.id)}
                                        className="text-xs text-gray-500 hover:text-brand transition-colors"
                                        title="Definir como primário"
                                    >
                                        Tornar primário
                                    </button>
                                )}
                                <button
                                    onClick={() => removeDomain(domain.id)}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Remover domínio"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
