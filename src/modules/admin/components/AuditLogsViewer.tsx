import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface AuditLog {
    id: string;
    action: string;
    table_name: string;
    record_id: string;
    created_at: string;
    profiles: { full_name: string; email: string } | null;
}

const PAGE_SIZE = 50;

export function AuditLogsViewer() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const [filterTable, setFilterTable] = useState('');
    const [filterAction, setFilterAction] = useState('');

    useEffect(() => {
        setPage(0);
        fetchLogs(0);
    }, [filterTable, filterAction]);

    const fetchLogs = async (currentPage: number) => {
        setLoading(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();

            if (!profile?.organization_id) return;

            const from = currentPage * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            let query = supabase
                .from('audit_logs')
                .select(`
                    id, action, table_name, record_id, created_at,
                    profiles!audit_logs_user_id_profiles_fkey(full_name, email)
                `)
                .eq('organization_id', profile.organization_id)
                .order('created_at', { ascending: false })
                .range(from, to);

            if (filterTable) {
                query = query.eq('table_name', filterTable);
            }
            if (filterAction) {
                query = query.eq('action', filterAction);
            }

            const { data, error } = await query;
            if (error) throw error;
            if (data) {
                setLogs(data as any[]);
                setHasMore(data.length === PAGE_SIZE);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const goToPage = (newPage: number) => {
        setPage(newPage);
        fetchLogs(newPage);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Histórico de Auditoria</h2>
                    <p className="text-sm text-gray-500 mt-1">Veja as últimas modificações no sistema.</p>
                </div>

                <div className="flex gap-3">
                    <select
                        value={filterAction}
                        onChange={e => setFilterAction(e.target.value)}
                        className="text-sm border-gray-300 rounded-md focus:ring-brand focus:border-brand"
                    >
                        <option value="">Todas as Ações</option>
                        <option value="INSERT">Inserções (CREATE)</option>
                        <option value="UPDATE">Atualizações (EDIT)</option>
                        <option value="DELETE">Exclusões (DELETE)</option>
                    </select>

                    <select
                        value={filterTable}
                        onChange={e => setFilterTable(e.target.value)}
                        className="text-sm border-gray-300 rounded-md focus:ring-brand focus:border-brand"
                    >
                        <option value="">Todos os Módulos</option>
                        <option value="profiles">Usuários</option>
                        <option value="organization_roles">Perfis de Acesso</option>
                        <option value="indicators">Indicadores</option>
                        <option value="contracts">Contratos</option>
                    </select>

                    <button onClick={() => fetchLogs(page)} className="p-2 border border-gray-300 bg-white rounded-md text-gray-500 hover:text-brand hover:border-brand">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Módulo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID do Registro</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="h-5 w-5 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
                                        <span>Carregando logs...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                    Nenhum log de auditoria encontrado.
                                </td>
                            </tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.action === 'INSERT' ? 'bg-green-100 text-green-800' :
                                            log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium capitalize">
                                        {log.table_name.replace('_', ' ')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900">{log.profiles?.full_name || 'Sistema'}</span>
                                            <span className="text-xs text-gray-500">{log.profiles?.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-xs">
                                        {log.record_id.slice(0, 8)}...
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(log.created_at).toLocaleString('pt-BR')}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {/* Pagination */}
            {!loading && logs.length > 0 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        Página {page + 1}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => goToPage(page - 1)}
                            disabled={page === 0}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => goToPage(page + 1)}
                            disabled={!hasMore}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Próximo
                        </button>
                    </div>
                </div>
            )}
            {error && (
                <div className="p-4 bg-red-50 text-red-700 text-sm border-t border-red-100">
                    Ocorreu um erro ao buscar os dados: {error}
                </div>
            )}
        </div>
    );
}
