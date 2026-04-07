import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface DashboardMetrics {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalActivations: number;
    pendingActivations: number;
    usersWithoutRole: number;
    usersWithoutRoleActive: number;
    usersWithoutRoleInactive: number;
    usersWithoutDeptOrTitle: number;
    totalLogins: number;
    totalLoginFailures: number;
    totalPasswordResets: number;
    loginTrend: { date: string; count: number }[];
    activationTrend: { date: string; count: number }[];
    resetTrend: { date: string; count: number }[];
    failureTrend: { date: string; count: number }[];
    roleDistribution: { name: string; count: number; color: string }[];
    corporateDomains: string[];
    nonCorporateEmailCount: number;
    nonCorporateEmails: { full_name: string; email: string }[];
}

const INITIAL_METRICS: DashboardMetrics = {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalActivations: 0,
    pendingActivations: 0,
    usersWithoutRole: 0,
    usersWithoutRoleActive: 0,
    usersWithoutRoleInactive: 0,
    usersWithoutDeptOrTitle: 0,
    totalLogins: 0,
    totalLoginFailures: 0,
    totalPasswordResets: 0,
    loginTrend: [],
    activationTrend: [],
    resetTrend: [],
    failureTrend: [],
    roleDistribution: [],
    corporateDomains: [],
    nonCorporateEmailCount: 0,
    nonCorporateEmails: [],
};

export function AuditDashboard() {
    const [metrics, setMetrics] = useState<DashboardMetrics>(INITIAL_METRICS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMetric, setSelectedMetric] = useState<'logins' | 'activations' | 'resets' | 'failures'>('logins');

    useEffect(() => {
        loadMetrics();
    }, []);

    const loadMetrics = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', session.user.id)
                .single();

            if (!profile?.organization_id) return;

            // Single RPC call returns all metrics computed server-side
            const { data, error: rpcError } = await supabase
                .rpc('get_audit_dashboard_metrics', {
                    p_organization_id: profile.organization_id,
                });

            if (rpcError) throw rpcError;

            if (data) {
                setMetrics({
                    totalUsers: data.totalUsers || 0,
                    activeUsers: data.activeUsers || 0,
                    inactiveUsers: data.inactiveUsers || 0,
                    totalActivations: data.totalActivations || 0,
                    pendingActivations: data.pendingActivations || 0,
                    usersWithoutRole: data.usersWithoutRole || 0,
                    usersWithoutRoleActive: data.usersWithoutRoleActive || 0,
                    usersWithoutRoleInactive: data.usersWithoutRoleInactive || 0,
                    usersWithoutDeptOrTitle: data.usersWithoutDeptOrTitle || 0,
                    totalLogins: data.totalLogins || 0,
                    totalLoginFailures: data.totalLoginFailures || 0,
                    totalPasswordResets: data.totalPasswordResets || 0,
                    loginTrend: data.loginTrend || [],
                    activationTrend: data.activationTrend || [],
                    resetTrend: data.resetTrend || [],
                    failureTrend: data.failureTrend || [],
                    roleDistribution: data.roleDistribution || [],
                    corporateDomains: data.corporateDomains || [],
                    nonCorporateEmailCount: data.nonCorporateEmailCount || 0,
                    nonCorporateEmails: data.nonCorporateEmails || [],
                });
            }
        } catch (err: any) {
            console.error('Failed to load dashboard metrics:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                        <div className="h-7 bg-gray-200 rounded w-1/3"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-700 text-sm border border-red-200 rounded-xl">
                Erro ao carregar métricas: {error}
            </div>
        );
    }

    const maxTrend = Math.max(...metrics.loginTrend.map(t => t.count), 1);

    return (
        <div className="space-y-6">
            {/* KPI Cards Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    icon="🔑"
                    label="Total de Acessos"
                    value={metrics.totalLogins}
                    subtitle="Logins registrados"
                    color="bg-blue-50 text-blue-700"
                    borderColor={selectedMetric === 'logins' ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-200"}
                    isSelected={selectedMetric === 'logins'}
                    onClick={() => setSelectedMetric('logins')}
                />
                <KPICard
                    icon="✅"
                    label="Ativações"
                    value={metrics.totalActivations}
                    subtitle={`${metrics.pendingActivations} pendentes`}
                    color="bg-green-50 text-green-700"
                    borderColor={selectedMetric === 'activations' ? "border-green-500 ring-2 ring-green-500/20" : "border-gray-200"}
                    isSelected={selectedMetric === 'activations'}
                    onClick={() => setSelectedMetric('activations')}
                />
                <KPICard
                    icon="🔄"
                    label="Redefinições de Senha"
                    value={metrics.totalPasswordResets}
                    subtitle="Solicitações de reset"
                    color="bg-amber-50 text-amber-700"
                    borderColor={selectedMetric === 'resets' ? "border-amber-500 ring-2 ring-amber-500/20" : "border-gray-200"}
                    isSelected={selectedMetric === 'resets'}
                    onClick={() => setSelectedMetric('resets')}
                />
                <KPICard
                    icon="⚠️"
                    label="Logins Falhos"
                    value={metrics.totalLoginFailures}
                    subtitle="Tentativas com erro"
                    color={metrics.totalLoginFailures > 10 ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-700"}
                    borderColor={selectedMetric === 'failures' ? "border-red-500 ring-2 ring-red-500/20" : metrics.totalLoginFailures > 10 ? "border-red-200" : "border-gray-200"}
                    isSelected={selectedMetric === 'failures'}
                    onClick={() => setSelectedMetric('failures')}
                />
            </div>

            {/* KPI Cards Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    icon="👥"
                    label="Total de Usuários"
                    value={metrics.totalUsers}
                    subtitle={`${metrics.activeUsers} ativos · ${metrics.inactiveUsers} inativos`}
                    color="bg-indigo-50 text-indigo-700"
                    borderColor="border-indigo-200"
                />
                <KPICard
                    icon="🏷️"
                    label="Sem Perfil de Acesso"
                    value={metrics.usersWithoutRole}
                    subtitle={`${metrics.usersWithoutRoleActive} ativos · ${metrics.usersWithoutRoleInactive} inativos`}
                    color={metrics.usersWithoutRole > 0 ? "bg-orange-50 text-orange-700" : "bg-gray-50 text-gray-700"}
                    borderColor={metrics.usersWithoutRole > 0 ? "border-orange-200" : "border-gray-200"}
                />
                <KPICard
                    icon="🏢"
                    label="Cadastro Incompleto"
                    value={metrics.usersWithoutDeptOrTitle}
                    subtitle="Sem departamento ou cargo"
                    color={metrics.usersWithoutDeptOrTitle > 0 ? "bg-yellow-50 text-yellow-700" : "bg-gray-50 text-gray-700"}
                    borderColor={metrics.usersWithoutDeptOrTitle > 0 ? "border-yellow-200" : "border-gray-200"}
                />
                <KPICard
                    icon="📧"
                    label="E-mail Não Corporativo"
                    value={metrics.nonCorporateEmailCount}
                    subtitle={metrics.corporateDomains.length === 0 ? 'Nenhum domínio cadastrado' : `Fora de ${metrics.corporateDomains.map(d => `@${d}`).join(', ')}`}
                    color={metrics.nonCorporateEmailCount > 0 && metrics.corporateDomains.length > 0 ? "bg-rose-50 text-rose-700" : "bg-gray-50 text-gray-700"}
                    borderColor={metrics.nonCorporateEmailCount > 0 && metrics.corporateDomains.length > 0 ? "border-rose-200" : "border-gray-200"}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Login Trend Chart */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">
                            {selectedMetric === 'logins' && 'Acessos — Últimos 30 dias'}
                            {selectedMetric === 'activations' && 'Ativações — Últimos 30 dias'}
                            {selectedMetric === 'resets' && 'Redefinições de Senha — Últimos 30 dias'}
                            {selectedMetric === 'failures' && 'Logins Falhos — Últimos 30 dias'}
                        </h3>
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Barras: diário</span>
                    </div>
                    <div className="p-6">
                        {(() => {
                            const trend = selectedMetric === 'logins' ? metrics.loginTrend :
                                          selectedMetric === 'activations' ? metrics.activationTrend :
                                          selectedMetric === 'resets' ? metrics.resetTrend :
                                          metrics.failureTrend;
                            
                            const total = trend.reduce((sum, t) => sum + t.count, 0);
                            const max = Math.max(...trend.map(t => t.count), 1);
                            const barColor = selectedMetric === 'logins' ? 'bg-blue-400 hover:bg-blue-500' :
                                           selectedMetric === 'activations' ? 'bg-green-400 hover:bg-green-500' :
                                           selectedMetric === 'resets' ? 'bg-amber-400 hover:bg-amber-500' :
                                           'bg-red-400 hover:bg-red-500';

                            if (total === 0) {
                                return (
                                    <div className="text-center py-8 text-gray-400 text-sm">
                                        <p>Nenhum dado registrado para este período.</p>
                                        <p className="text-xs mt-1">Os dados serão exibidos conforme as interações ocorram.</p>
                                    </div>
                                );
                            }

                            return (
                                <>
                                    <div className="flex items-end gap-[2px] h-32">
                                        {trend.map((item, i) => (
                                            <div key={i} className="flex-1 h-full flex flex-col justify-end items-center group relative">
                                                <div
                                                    className={`w-full ${barColor} rounded-t transition-all cursor-default min-h-[2px]`}
                                                    style={{ height: `${Math.max((item.count / max) * 100, 2)}%` }}
                                                />
                                                <div className="absolute -top-8 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                                    {new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}: {item.count}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-2 text-[10px] text-gray-400">
                                        <span>{trend[0]?.date ? new Date(trend[0].date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : ''}</span>
                                        <span>Hoje</span>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>

                {/* Role Distribution */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-sm font-semibold text-gray-900">Distribuição por Perfil de Acesso</h3>
                    </div>
                    <div className="p-6 space-y-3">
                        {metrics.roleDistribution.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                Nenhum perfil com usuários atribuídos.
                            </div>
                        ) : (
                            metrics.roleDistribution.map((role, i) => {
                                const pct = metrics.totalUsers > 0 ? (role.count / metrics.totalUsers) * 100 : 0;
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full inline-block"
                                                    style={{ backgroundColor: role.color }}
                                                />
                                                {role.name}
                                            </span>
                                            <span className="text-xs text-gray-500">{role.count} ({pct.toFixed(0)}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full transition-all"
                                                style={{ width: `${pct}%`, backgroundColor: role.color }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Non-corporate emails table */}
            {metrics.corporateDomains.length > 0 && metrics.nonCorporateEmailCount > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Usuários com E-mail Não Corporativo</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Domínios cadastrados: {metrics.corporateDomains.map(d => `@${d}`).join(', ')}</p>
                        </div>
                        <span className="text-xs font-medium bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                            {metrics.nonCorporateEmailCount}
                        </span>
                    </div>
                    <div className="overflow-x-auto max-h-64 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">E-mail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {metrics.nonCorporateEmails.map((user, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-6 py-2 text-sm text-gray-900">{user.full_name || 'Sem Nome'}</td>
                                        <td className="px-6 py-2 text-sm text-gray-500">{user.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {metrics.nonCorporateEmailCount > 50 && (
                            <div className="px-6 py-2 text-xs text-gray-400 text-center border-t">
                                Exibindo 50 de {metrics.nonCorporateEmailCount} registros
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function KPICard({ icon, label, value, subtitle, color, borderColor, onClick, isSelected }: {
    icon: string;
    label: string;
    value: number;
    subtitle: string;
    color: string;
    borderColor: string;
    onClick?: () => void;
    isSelected?: boolean;
}) {
    return (
        <div 
            onClick={onClick}
            className={`bg-white rounded-xl border-2 ${borderColor} shadow-sm p-5 hover:shadow-md transition-all cursor-pointer ${isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'}`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">{value.toLocaleString('pt-BR')}</p>
                    <p className="text-[11px] font-medium text-gray-400 mt-1 truncate" title={subtitle}>{subtitle}</p>
                </div>
                <span className={`text-xl ${color} rounded-lg p-2.5 shadow-inner`}>{icon}</span>
            </div>
            {isSelected && (
                <div className="mt-4 flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                        <div className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-tighter opacity-70">Visualizando no gráfico</span>
                </div>
            )}
        </div>
    );
}
