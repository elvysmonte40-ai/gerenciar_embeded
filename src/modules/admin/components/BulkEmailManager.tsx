import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { Users, Briefcase, Building, Shield, Mail, Send, CheckCircle2, AlertCircle, Eye, ChevronRight } from 'lucide-react';

interface Template {
    template_type: string;
    subject: string;
    html_content: string;
    label: string;
}

interface FilterOption {
    id: string;
    name: string;
}

type FilterType = 'profiles' | 'roles' | 'departments' | 'users';

export default function BulkEmailManager() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('custom');
    const [subject, setSubject] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    
    const [filterType, setFilterType] = useState<FilterType>('users');
    const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
    
    const [loading, setLoading] = useState(false);
    const [fetchingFilters, setFetchingFilters] = useState(false);
    const [resolvingRecipients, setResolvingRecipients] = useState(false);
    const [recipientCount, setRecipientCount] = useState(0);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [previewMode, setPreviewMode] = useState(false);
    
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Fetch initial data
    useEffect(() => {
        fetchTemplates();
    }, []);

    // Update filter options when filterType changes
    useEffect(() => {
        fetchFilterOptions();
        setSelectedFilters([]);
        setRecipientCount(0);
    }, [filterType]);

    // Resolve recipient count when selected filters change
    useEffect(() => {
        if (selectedFilters.length > 0) {
            resolveRecipientCount();
        } else {
            setRecipientCount(0);
        }
    }, [selectedFilters]);

    // Live preview update
    useEffect(() => {
        if (iframeRef.current && htmlContent) {
            const doc = iframeRef.current.contentDocument;
            if (doc) {
                doc.open();
                doc.write(htmlContent);
                doc.close();
            }
        }
    }, [htmlContent, previewMode]);

    const fetchTemplates = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch('/api/emails/templates', {
                headers: { Authorization: `Bearer ${session?.access_token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setTemplates(data);
            }
        } catch (err) {
            console.error('Falha ao carregar templates:', err);
        }
    };

    const fetchFilterOptions = async () => {
        setFetchingFilters(true);
        try {
            let data: FilterOption[] = [];
            switch (filterType) {
                case 'roles': // Perfis
                    const { data: roles } = await supabase.from('organization_roles').select('id, name').eq('is_active', true);
                    data = roles || [];
                    break;
                case 'departments':
                    const { data: depts } = await supabase.from('departments').select('id, name').eq('is_active', true);
                    data = depts || [];
                    break;
                case 'profiles': // Cargos (Job Titles)
                    const { data: jobs } = await supabase.from('job_titles').select('id, title').eq('is_active', true);
                    data = jobs?.map(j => ({ id: j.id, name: j.title })) || [];
                    break;
                case 'users':
                    const { data: users } = await supabase.from('profiles').select('id, full_name').eq('status', 'active');
                    data = users?.map(u => ({ id: u.id, name: u.full_name || 'Usuário Sem Nome' })) || [];
                    break;
            }
            setFilterOptions(data.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (err) {
            console.error('Falha ao carregar opções de filtro:', err);
        } finally {
            setFetchingFilters(false);
        }
    };

    const resolveRecipientCount = async () => {
        setResolvingRecipients(true);
        try {
            let query = supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'active');
            
            if (filterType === 'roles') query = query.in('organization_role_id', selectedFilters);
            else if (filterType === 'departments') query = query.in('department_id', selectedFilters);
            else if (filterType === 'profiles') query = query.in('job_title_id', selectedFilters);
            else if (filterType === 'users') query = query.in('id', selectedFilters);
            
            const { count } = await query;
            setRecipientCount(count || 0);
        } catch (err) {
            console.error('Erro ao resolver contagem:', err);
        } finally {
            setResolvingRecipients(false);
        }
    };

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const type = e.target.value;
        setSelectedTemplate(type);
        
        if (type === 'custom') {
            setSubject('');
            setHtmlContent('');
        } else {
            const template = templates.find(t => t.template_type === type);
            if (template) {
                setSubject(template.subject);
                setHtmlContent(template.html_content);
            }
        }
    };

    const toggleFilter = (id: string) => {
        setSelectedFilters(prev => 
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    const handleSend = async () => {
        if (!subject || !htmlContent || selectedFilters.length === 0) {
            setMessage({ type: 'error', text: 'Preencha todos os campos e selecione os destinatários.' });
            return;
        }

        if (!confirm(`Confirmar o envio para ${recipientCount} destinatários?`)) return;

        setLoading(true);
        setMessage(null);
        
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch('/api/emails/bulk-send', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({
                    subject,
                    htmlContent,
                    filters: {
                        type: filterType,
                        ids: selectedFilters
                    },
                    templateType: selectedTemplate
                })
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Erro ao enviar emails');

            setMessage({ type: 'success', text: `Envio iniciado com sucesso para ${recipientCount} pessoas!` });
            
            // Reset state
            setSelectedFilters([]);
            setRecipientCount(0);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Envio de E-mail em Massa</h2>
                    <p className="text-gray-500 mt-1">Crie comunicados e envie para grupos específicos da organização.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            previewMode ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <Eye className="w-4 h-4" />
                        {previewMode ? 'Sair da Pré-visualização' : 'Pré-visualizar E-mail'}
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={loading || recipientCount === 0 || !subject || !htmlContent}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-100"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                        {loading ? 'Enviando...' : 'Disparar Agora'}
                    </button>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in zoom-in-95 duration-300 ${
                    message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    <span className="text-sm font-medium">{message.text}</span>
                </div>
            )}

            {previewMode ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm h-[700px] flex flex-col">
                    <div className="mb-6 pb-6 border-b border-gray-100">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Assunto:</div>
                        <h3 className="text-xl font-bold text-gray-900">{subject || '(Sem Assunto)'}</h3>
                    </div>
                    <iframe
                        ref={iframeRef}
                        className="flex-1 w-full border-none rounded-lg"
                        title="Global Preview"
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Composição */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
                            <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-2">
                                <Mail className="w-5 h-5" />
                                <h3>Compor E-mail</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Template Base</label>
                                    <select
                                        value={selectedTemplate}
                                        onChange={handleTemplateChange}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                    >
                                        <option value="custom">-- E-mail em Branco --</option>
                                        {templates.map(t => (
                                            <option key={t.template_type} value={t.template_type}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Assunto do E-mail</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                        placeholder="Ex: Atualização Importante"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700">Conteúdo HTML</label>
                                    <span className="text-[10px] text-gray-400 font-mono">Suporta variáves: {'{{nome}}'}</span>
                                </div>
                                <textarea
                                    value={htmlContent}
                                    onChange={e => setHtmlContent(e.target.value)}
                                    placeholder="Escreva seu comunicado aqui (suporta HTML)..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono min-h-[400px] focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Destinatários */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                                    <Users className="w-5 h-5" />
                                    <h3>Destinatários</h3>
                                </div>
                                {selectedFilters.length > 0 && (
                                    <button 
                                        onClick={() => setSelectedFilters([])}
                                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                                    >
                                        Limpar
                                    </button>
                                )}
                            </div>

                            {/* Tipo de Filtro */}
                            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
                                {[
                                    { id: 'roles', label: 'Perfis', icon: Shield },
                                    { id: 'profiles', label: 'Cargos', icon: Briefcase },
                                    { id: 'departments', label: 'Depto', icon: Building },
                                    { id: 'users', label: 'Usuários', icon: Users },
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setFilterType(type.id as FilterType)}
                                        className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-lg text-[10px] font-bold transition-all ${
                                            filterType === type.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-white/50'
                                        }`}
                                    >
                                        <type.icon className="w-4 h-4" />
                                        {type.label}
                                    </button>
                                ))}
                            </div>

                            {/* Lista de Opções */}
                            <div className="flex-1 overflow-y-auto space-y-2 min-h-[300px] max-h-[500px] pr-1">
                                {fetchingFilters ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                                        <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                                        <span className="text-xs uppercase tracking-widest font-bold">Carregando...</span>
                                    </div>
                                ) : filterOptions.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400 text-sm">Nenhuma opção encontrada.</div>
                                ) : (
                                    filterOptions.map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => toggleFilter(opt.id)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm transition-all text-left ${
                                                selectedFilters.includes(opt.id)
                                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                                    : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'
                                            }`}
                                        >
                                            <span className="truncate">{opt.name}</span>
                                            {selectedFilters.includes(opt.id) && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                                        </button>
                                    ))
                                )}
                            </div>

                            {/* Resumo */}
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="bg-indigo-50 rounded-2xl p-4 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-indigo-400 uppercase font-black">Total Resolvido</span>
                                        <span className="text-2xl font-black text-indigo-700">
                                            {resolvingRecipients ? '...' : recipientCount}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-indigo-400 uppercase font-black">Segmentos</span>
                                        <span className="text-sm font-black text-indigo-600">
                                            {selectedFilters.length} selecionados
                                        </span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-3 text-center px-4">
                                    O envio é filtrado por membros ativos na organização selecionada.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
