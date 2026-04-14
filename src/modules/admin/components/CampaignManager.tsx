import React, { useState, useEffect } from 'react';
import { Plus, Mail, Edit, Play } from 'lucide-react';
import CampaignForm from './CampaignForm';

export interface Campaign {
    id: string;
    name: string;
    trigger_event: string;
    html_content: string;
    status: 'draft' | 'active';
    created_at: string;
}

export default function CampaignManager() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
    const [testEmail, setTestEmail] = useState('');
    const [testingId, setTestingId] = useState<string | null>(null);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/emails/campaigns');
            if (!res.ok) throw new Error('Falha ao carregar campanhas');
            const data = await res.json();
            setCampaigns(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const handleTestSend = async (campaignId: string) => {
        if (!testEmail) {
            alert("Por favor, digite um e-mail para teste.");
            return;
        }

        try {
            setTestingId(campaignId);
            const res = await fetch('/api/emails/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId,
                    to: testEmail,
                    variables: { nome: 'Usuário de Teste' }
                })
            });

            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || 'Erro ao enviar');

            alert('E-mail de teste enviado com sucesso!');
            setTestEmail('');
        } catch (err: any) {
            alert(`Erro: ${err.message}`);
        } finally {
            setTestingId(null);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Carregando campanhas...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Erro: {error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-medium text-gray-900">Campanhas de E-mail</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Gerencie templates HTML e ative gatilhos automáticos para envio via Resend.
                    </p>
                </div>
                <button
                    onClick={() => { setEditingCampaign(null); setIsFormOpen(true); }}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    Nova Campanha
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                <ul className="divide-y divide-gray-200">
                    {campaigns.length === 0 ? (
                        <li className="px-6 py-12 text-center text-gray-500">
                            <Mail className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                            Nenhuma campanha configurada. Clique em "Nova Campanha" para começar.
                        </li>
                    ) : (
                        campaigns.map((c) => (
                            <li key={c.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-indigo-600 truncate">{c.name}</h3>
                                        <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                                            <span className="inline-flex items-center gap-1">
                                                <span className={`w-2 h-2 rounded-full ${c.status === 'active' ? 'bg-green-500' : 'bg-yellow-400'}`}></span>
                                                {c.status === 'active' ? 'Ativo' : 'Rascunho'}
                                            </span>
                                            <span>•</span>
                                            <span>Gatilho: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">{c.trigger_event}</span></span>
                                            <span>•</span>
                                            <span>Atualizado em {new Date(c.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="ml-4 flex items-center space-x-4">
                                        {/* Disparo de Teste Rápido */}
                                        {c.status === 'active' && (
                                            <div className="flex items-center gap-2 mr-4 border-r pr-4">
                                                <input
                                                    type="email"
                                                    placeholder="E-mail de teste"
                                                    className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                    value={testEmail}
                                                    onChange={e => setTestEmail(e.target.value)}
                                                />
                                                <button
                                                    onClick={() => handleTestSend(c.id)}
                                                    disabled={testingId === c.id}
                                                    className="text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                                                    title="Enviar teste"
                                                >
                                                    <Play className="h-5 w-5" />
                                                </button>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => { setEditingCampaign(c); setIsFormOpen(true); }}
                                            className="text-gray-400 hover:text-indigo-600 transition-colors"
                                            title="Editar"
                                        >
                                            <Edit className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {isFormOpen && (
                <CampaignForm
                    campaign={editingCampaign}
                    onClose={() => setIsFormOpen(false)}
                    onSaved={() => {
                        setIsFormOpen(false);
                        fetchCampaigns();
                    }}
                />
            )}
        </div>
    );
}
