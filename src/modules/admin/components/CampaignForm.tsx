import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { Campaign } from './CampaignManager';

interface Props {
    campaign: Campaign | null;
    onClose: () => void;
    onSaved: () => void;
}

export default function CampaignForm({ campaign, onClose, onSaved }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: campaign?.name || '',
        trigger_event: campaign?.trigger_event || 'manual',
        status: campaign?.status || 'draft',
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const isEditing = !!campaign?.id;
            const method = isEditing ? 'PUT' : 'POST';
            const body = isEditing ? { id: campaign.id, ...formData } : formData;

            const res = await fetch('/api/emails/campaigns', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erro ao salvar campanha');
            }

            onSaved();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                        {campaign ? 'Editar Campanha' : 'Nova Campanha de E-mail'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <form id="campaign-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Coluna Esquerda: Meta dados */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nome da Campanha (Assunto)</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={100}
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Ex: Bem-vindo ao Sistema!"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Este texto será usado como o "Assunto" do e-mail.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Gatilho (Evento)</label>
                                    <select
                                        value={formData.trigger_event}
                                        onChange={e => setFormData({ ...formData, trigger_event: e.target.value })}
                                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="manual">Disparo Manual (em Massa)</option>
                                        <option value="welcome_email">Novo Usuário (Boas vindas)</option>
                                        <option value="password_reset">Redefinição de Senha</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <div className="mt-2 flex items-center space-x-4">
                                        <label className="inline-flex items-center text-sm">
                                            <input
                                                type="radio"
                                                value="active"
                                                checked={formData.status === 'active'}
                                                onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'draft' })}
                                                className="form-radio text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                            />
                                            <span className="ml-2 text-gray-700">Ativo</span>
                                        </label>
                                        <label className="inline-flex items-center text-sm">
                                            <input
                                                type="radio"
                                                value="draft"
                                                checked={formData.status === 'draft'}
                                                onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'draft' })}
                                                className="form-radio text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                            />
                                            <span className="ml-2 text-gray-700">Rascunho</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Coluna Direita: HTML Customizado */}
                            <div className="h-full flex flex-col">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Conteúdo HTML Personalizado
                                </label>
                                <div className="flex-1 min-h-[300px] relative">
                                    <textarea
                                        required
                                        value={formData.html_content}
                                        onChange={e => setFormData({ ...formData, html_content: e.target.value })}
                                        className="absolute inset-0 w-full h-full font-mono text-sm border border-gray-300 rounded-md shadow-sm p-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 resize-none bg-gray-50"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Você pode usar variáveis no formato {'{{variavel}}'}, por exemplo `{'{{nome}}'}` ou `{'{{link}}'}`.
                                </p>
                            </div>

                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3 rounded-b-lg">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="campaign-form"
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        <Save className="-ml-1 mr-2 h-4 w-4" />
                        {loading ? 'Salvando...' : 'Salvar Campanha'}
                    </button>
                </div>
            </div>
        </div>
    );
}
