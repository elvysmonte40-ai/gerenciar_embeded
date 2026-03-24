import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';

interface Template {
    template_type: string;
    subject: string;
    html_content: string;
    is_customized: boolean;
    updated_at: string | null;
    label: string;
    description: string;
}

export default function EmailTemplateEditor() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [editSubject, setEditSubject] = useState('');
    const [editHtml, setEditHtml] = useState('');
    const [saving, setSaving] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [sendingTest, setSendingTest] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const getToken = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token || '';
    };

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const res = await fetch('/api/emails/templates', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Falha ao carregar templates');
            const data = await res.json();
            setTemplates(data);
        } catch (err: any) {
            showMessage('error', err.message);
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

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 4000);
    };

    const selectTemplate = (template: Template) => {
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
            const res = await fetch('/api/emails/templates', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    template_type: selectedTemplate.template_type,
                    subject: editSubject,
                    html_content: editHtml,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error);
            }

            showMessage('success', 'Template salvo com sucesso!');
            await fetchTemplates();
            setSelectedTemplate(prev => prev ? { ...prev, is_customized: true } : null);
        } catch (err: any) {
            showMessage('error', err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleRestore = async () => {
        if (!selectedTemplate) return;
        if (!confirm('Restaurar o template para o padrão? As alterações customizadas serão perdidas.')) return;

        try {
            const token = await getToken();
            const res = await fetch(`/api/emails/templates?template_type=${selectedTemplate.template_type}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Falha ao restaurar');

            showMessage('success', 'Template restaurado ao padrão!');
            await fetchTemplates();

            const updated = templates.find(t => t.template_type === selectedTemplate.template_type);
            if (updated) {
                selectTemplate(updated);
            }
            setSelectedTemplate(null);
        } catch (err: any) {
            showMessage('error', err.message);
        }
    };

    const handleTestSend = async () => {
        if (!testEmail || !selectedTemplate) return;
        setSendingTest(true);
        try {
            const token = await getToken();

            const res = await fetch('/api/emails/send-test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    to: testEmail,
                    subject: editSubject,
                    htmlContent: editHtml,
                    variables: { nome: 'Usuário de Teste', reset_url: '#' },
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro ao enviar');

            showMessage('success', `Email de teste enviado para ${testEmail}!`);
            setTestEmail('');
        } catch (err: any) {
            showMessage('error', `Falha no envio: ${err.message}`);
        } finally {
            setSendingTest(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (selectedTemplate) {
        return (
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSelectedTemplate(null)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {selectedTemplate.label}
                            </h3>
                            <p className="text-sm text-gray-500">{selectedTemplate.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedTemplate.is_customized && (
                            <button
                                onClick={handleRestore}
                                className="px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Restaurar Padrão
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {saving ? 'Salvando...' : '💾 Salvar Template'}
                        </button>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className={`px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {message.text}
                    </div>
                )}

                {/* Subject */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assunto do Email</label>
                    <input
                        type="text"
                        value={editSubject}
                        onChange={e => setEditSubject(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Split Editor */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4" style={{ height: 'calc(100vh - 360px)' }}>
                    {/* Code Editor */}
                    <div className="flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white">
                        <div className="px-4 py-2 bg-gray-800 text-gray-300 text-xs font-mono flex items-center justify-between">
                            <span>📝 Editor HTML</span>
                            <span className="text-gray-500">{editHtml.length} caracteres</span>
                        </div>
                        <textarea
                            value={editHtml}
                            onChange={e => setEditHtml(e.target.value)}
                            className="flex-1 p-4 font-mono text-sm text-gray-800 bg-gray-50 resize-none focus:outline-none focus:bg-white transition-colors"
                            style={{ tabSize: 2, lineHeight: '1.6' }}
                            spellCheck={false}
                        />
                    </div>

                    {/* Live Preview */}
                    <div className="flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white">
                        <div className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-medium flex items-center justify-between border-b border-gray-200">
                            <span>👁️ Pré-visualização</span>
                            <span className="text-gray-400">Atualização em tempo real</span>
                        </div>
                        <iframe
                            ref={iframeRef}
                            sandbox="allow-same-origin"
                            className="flex-1 w-full bg-white"
                            title="Preview do template"
                            style={{ minHeight: '400px' }}
                        />
                    </div>
                </div>

                {/* Test Send */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-sm font-medium text-gray-600 whitespace-nowrap">📤 Enviar Teste:</span>
                    <input
                        type="email"
                        placeholder="email@exemplo.com"
                        value={testEmail}
                        onChange={e => setTestEmail(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                        onClick={handleTestSend}
                        disabled={sendingTest || !testEmail}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                    >
                        {sendingTest ? 'Enviando...' : 'Enviar'}
                    </button>
                </div>

                {/* Variables Help */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <h4 className="text-sm font-semibold text-amber-800 mb-2">📌 Variáveis Disponíveis</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-amber-700">
                        {selectedTemplate.template_type === 'welcome' ? (
                            <>
                                <code className="bg-amber-100 px-2 py-1 rounded">{'{{nome}}'}</code>
                                <span>Nome do usuário</span>
                                <span></span>
                            </>
                        ) : (
                            <>
                                <code className="bg-amber-100 px-2 py-1 rounded">{'{{reset_url}}'}</code>
                                <span>Link de redefinição</span>
                                <span></span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Template List View
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">Templates do Sistema</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Personalize os templates de email enviados automaticamente pelo sistema.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(template => (
                    <button
                        key={template.template_type}
                        onClick={() => selectTemplate(template)}
                        className="text-left p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                                {template.template_type === 'welcome' ? (
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                )}
                            </div>
                            {template.is_customized && (
                                <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                    Customizado
                                </span>
                            )}
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {template.label}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">{template.description}</p>
                        <div className="text-xs text-gray-400">
                            {template.updated_at
                                ? `Atualizado em ${new Date(template.updated_at).toLocaleDateString('pt-BR')}`
                                : 'Usando template padrão'}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
