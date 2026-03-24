import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface EmailLog {
    id: string;
    email_type: string;
    from_email: string;
    to_email: string;
    subject: string;
    status: string;
    sent_at: string;
    delivered_at: string | null;
    opened_at: string | null;
    clicked_at: string | null;
    bounced_at: string | null;
    error_message: string | null;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    sent: { label: 'Enviado', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    delivered: { label: 'Entregue', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
    opened: { label: 'Aberto', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    clicked: { label: 'Clicado', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
    bounced: { label: 'Rejeitado', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
    complained: { label: 'Spam', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
};

const typeLabels: Record<string, string> = {
    welcome: '🎉 Boas-vindas',
    password_reset: '🔐 Redefinição',
    campaign: '📧 Campanha',
};

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function EmailLogsViewer() {
    const [logs, setLogs] = useState<EmailLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        loadLogs();
    }, [filterType, filterStatus]);

    async function loadLogs() {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            let query = supabase
                .from('email_logs')
                .select('*')
                .order('sent_at', { ascending: false })
                .limit(100);

            if (filterType !== 'all') {
                query = query.eq('email_type', filterType);
            }
            if (filterStatus !== 'all') {
                query = query.eq('status', filterStatus);
            }

            const { data, error } = await query;
            if (error) throw error;
            setLogs(data || []);
        } catch (err) {
            console.error('Erro ao carregar logs:', err);
        } finally {
            setLoading(false);
        }
    }

    const stats = {
        total: logs.length,
        delivered: logs.filter(l => l.status === 'delivered' || l.status === 'opened' || l.status === 'clicked').length,
        bounced: logs.filter(l => l.status === 'bounced' || l.status === 'complained').length,
        opened: logs.filter(l => l.status === 'opened' || l.status === 'clicked').length,
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                    <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
                    <p className="text-xs text-text-secondary mt-1">Total Enviados</p>
                </div>
                <div className="bg-white rounded-lg border border-green-200 p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                    <p className="text-xs text-text-secondary mt-1">Entregues</p>
                </div>
                <div className="bg-white rounded-lg border border-red-200 p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">{stats.bounced}</p>
                    <p className="text-xs text-text-secondary mt-1">Rejeitados</p>
                </div>
                <div className="bg-white rounded-lg border border-emerald-200 p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{stats.opened}</p>
                    <p className="text-xs text-text-secondary mt-1">Abertos</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-brand focus:ring-brand"
                >
                    <option value="all">Todos os tipos</option>
                    <option value="welcome">Boas-vindas</option>
                    <option value="password_reset">Redefinição</option>
                    <option value="campaign">Campanha</option>
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-brand focus:ring-brand"
                >
                    <option value="all">Todos os status</option>
                    <option value="sent">Enviado</option>
                    <option value="delivered">Entregue</option>
                    <option value="opened">Aberto</option>
                    <option value="bounced">Rejeitado</option>
                </select>
                <button
                    onClick={loadLogs}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors"
                >
                    ↻ Atualizar
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-text-secondary">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-brand border-t-transparent mb-2"></div>
                        <p>Carregando logs...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-12 text-center text-text-secondary">
                        <span className="text-3xl block mb-2">📭</span>
                        <p className="font-medium">Nenhum email encontrado</p>
                        <p className="text-sm mt-1">Os logs aparecerão aqui quando emails forem enviados.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/80">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Tipo</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Destinatário</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Assunto</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Enviado em</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs.map((log) => {
                                    const config = statusConfig[log.status] || statusConfig.sent;
                                    return (
                                        <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 text-sm whitespace-nowrap">
                                                {typeLabels[log.email_type] || log.email_type}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-text-primary font-medium whitespace-nowrap">
                                                {log.to_email}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-text-secondary max-w-[250px] truncate">
                                                {log.subject}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.color}`}>
                                                    {config.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
                                                {formatDate(log.sent_at)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
