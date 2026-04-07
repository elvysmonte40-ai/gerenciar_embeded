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

interface RecentEvent {
    id: string;
    user_id?: string;
    full_name: string;
    email: string;
    created_at: string;
    ip_address?: string;
    user_agent?: string;
    metadata?: any;
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
    const [selectedMetric, setSelectedMetric] = useState<'logins' | 'activations' | 'resets' | 'failures' | 'users' | 'no-role' | 'incomplete' | 'non-corporate'>('logins');
    const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        loadMetrics();
    }, []);

    useEffect(() => {
        // Clear details when metric changes
        setRecentEvents([]);
        loadEventDetails();
    }, [selectedMetric]);

    const loadEventDetails = async (currentMetrics?: DashboardMetrics) => {
        setLoadingDetails(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', session.user.id)
                .single();

            if (!profile?.organization_id) return;

            let query;
            if (selectedMetric === 'logins') {
                query = supabase
                    .from('auth_events')
                    .select('id, user_id, created_at, ip_address, user_agent, profiles(full_name, email)')
                    .eq('organization_id', profile.organization_id)
                    .eq('event_type', 'LOGIN')
                    .order('created_at', { ascending: false })
                    .limit(20);
            } else if (selectedMetric === 'resets') {
                query = supabase
                    .from('auth_events')
                    .select('id, user_id, created_at, ip_address, profiles(full_name, email)')
                    .eq('organization_id', profile.organization_id)
                    .eq('event_type', 'PASSWORD_RESET')
                    .order('created_at', { ascending: false })
                    .limit(20);
            } else if (selectedMetric === 'failures') {
                query = supabase
                    .from('auth_events')
                    .select('id, user_id, created_at, ip_address, metadata, profiles(full_name, email)')
                    .eq('organization_id', profile.organization_id)
                    .eq('event_type', 'LOGIN_FAILED')
                    .order('created_at', { ascending: false })
                    .limit(20);
            } else if (selectedMetric === 'activations') {
                query = supabase
                    .from('profiles')
                    .select('id, full_name, email, activated_at')
                    .eq('organization_id', profile.organization_id)
                    .not('activated_at', 'is', null)
                    .order('activated_at', { ascending: false })
                    .limit(20);
            } else if (selectedMetric === 'users') {
                query = supabase
                    .from('profiles')
                    .select('id, full_name, email, created_at, status')
                    .eq('organization_id', profile.organization_id)
                    .order('created_at', { ascending: false })
                    .limit(20);
            } else if (selectedMetric === 'no-role') {
                query = supabase
                    .from('profiles')
                    .select('id, full_name, email, created_at, status')
                    .eq('organization_id', profile.organization_id)
                    .is('organization_role_id', null)
                    .order('created_at', { ascending: false })
                    .limit(20);
            } else if (selectedMetric === 'incomplete') {
                query = supabase
                    .from('profiles')
                    .select('id, full_name, email, created_at, department_id, job_title_id')
                    .eq('organization_id', profile.organization_id)
                    .or('department_id.is.null,job_title_id.is.null')
                    .order('created_at', { ascending: false })
                    .limit(20);
            } else if (selectedMetric === 'non-corporate') {
                // Use already calculated emails from metrics summary if available
                const activeMetrics = currentMetrics || metrics;
                if (activeMetrics.nonCorporateEmails.length > 0) {
                    const emails = activeMetrics.nonCorporateEmails.map(e => e.email);
                    query = supabase
                        .from('profiles')
                        .select('id, full_name, email, created_at')
                        .eq('organization_id', profile.organization_id)
                        .in('email', emails)
                        .order('created_at', { ascending: false })
                        .limit(20);
                } else {
                    query = null;
                }
            }

            if (query) {
                const { data, error: queryError } = await query;
                if (queryError) throw queryError;
                
                const mappedEvents: RecentEvent[] = (data as any[]).map(item => {
                    const profileData = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
                    const finalProfile = profileData || item;
                    return {
                        id: item.id,
                        user_id: item.user_id || item.id,
                        full_name: finalProfile?.full_name || 'Usuário',
                        email: finalProfile?.email || 'Sem e-mail',
                        created_at: item.created_at || item.last_login_at || item.activated_at,
                        ip_address: item.ip_address,
                        user_agent: item.user_agent,
                        metadata: item.metadata
                    };
                });
                setRecentEvents(mappedEvents);
            }
        } catch (err) {
            console.error('Error fetching event details:', err);
        } finally {
            setLoadingDetails(false);
        }
    };

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
                const refreshedMetrics = {
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
                };
                setMetrics(refreshedMetrics);
                // Also load initial details
                loadEventDetails(refreshedMetrics);
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
                    borderColor={selectedMetric === 'users' ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-gray-200"}
                    isSelected={selectedMetric === 'users'}
                    onClick={() => setSelectedMetric('users')}
                />
                <KPICard
                    icon="🏷️"
                    label="Sem Perfil de Acesso"
                    value={metrics.usersWithoutRole}
                    subtitle={`${metrics.usersWithoutRoleActive} ativos · ${metrics.usersWithoutRoleInactive} inativos`}
                    color={metrics.usersWithoutRole > 0 ? "bg-orange-50 text-orange-700" : "bg-gray-50 text-gray-700"}
                    borderColor={selectedMetric === 'no-role' ? "border-orange-500 ring-2 ring-orange-500/20" : metrics.usersWithoutRole > 0 ? "border-orange-200" : "border-gray-200"}
                    isSelected={selectedMetric === 'no-role'}
                    onClick={() => setSelectedMetric('no-role')}
                />
                <KPICard
                    icon="🏢"
                    label="Cadastro Incompleto"
                    value={metrics.usersWithoutDeptOrTitle}
                    subtitle="Sem departamento ou cargo"
                    color={metrics.usersWithoutDeptOrTitle > 0 ? "bg-yellow-50 text-yellow-700" : "bg-gray-50 text-gray-700"}
                    borderColor={selectedMetric === 'incomplete' ? "border-yellow-500 ring-2 ring-yellow-500/20" : metrics.usersWithoutDeptOrTitle > 0 ? "border-yellow-200" : "border-gray-200"}
                    isSelected={selectedMetric === 'incomplete'}
                    onClick={() => setSelectedMetric('incomplete')}
                />
                <KPICard
                    icon="📧"
                    label="E-mail Não Corporativo"
                    value={metrics.nonCorporateEmailCount}
                    subtitle={metrics.corporateDomains.length === 0 ? 'Nenhum domínio cadastrado' : `Fora de ${metrics.corporateDomains.map(d => `@${d}`).join(', ')}`}
                    color={metrics.nonCorporateEmailCount > 0 && metrics.corporateDomains.length > 0 ? "bg-rose-50 text-rose-700" : "bg-gray-50 text-gray-700"}
                    borderColor={selectedMetric === 'non-corporate' ? "border-rose-500 ring-2 ring-rose-500/20" : metrics.nonCorporateEmailCount > 0 && metrics.corporateDomains.length > 0 ? "border-rose-200" : "border-gray-200"}
                    isSelected={selectedMetric === 'non-corporate'}
                    onClick={() => setSelectedMetric('non-corporate')}
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

            {/* Detail Section: Relationship with Users */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            {selectedMetric === 'logins' && 'Atividade Recente: Acessos'}
                            {selectedMetric === 'activations' && 'Atividade Recente: Ativações'}
                            {selectedMetric === 'resets' && 'Atividade Recente: Redefinições de Senha'}
                            {selectedMetric === 'failures' && 'Atividade Recente: Tentativas Falhas'}
                            {selectedMetric === 'users' && 'Novos Usuários Cadastrados'}
                            {selectedMetric === 'no-role' && 'Usuários Sem Perfil de Acesso'}
                            {selectedMetric === 'incomplete' && 'Usuários com Cadastro Incompleto'}
                            {selectedMetric === 'non-corporate' && 'Usuários com E-mail Externo'}
                        </h3>
                        <p className="text-[10px] text-gray-500 font-medium">Relacionamento detalhado com os perfis de usuários envolvidos.</p>
                    </div>
                </div>
                
                {loadingDetails ? (
                    <div className="p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-8 w-8 border-3 border-brand border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Carregando detalhes...</span>
                        </div>
                    </div>
                ) : recentEvents.length === 0 ? (
                    <div className="p-12 text-center bg-gray-50/30">
                        <p className="text-gray-400 text-sm font-medium italic">Nenhum evento recente encontrado para esta categoria.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-[#fcfdff]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Usuário</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Identificação</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Metadados / Origem</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Data e Hora</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-50">
                                {recentEvents.map((event) => (
                                    <tr key={event.id} className="hover:bg-[#f8fbff] transition-all group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-200 group-hover:bg-brand group-hover:text-white group-hover:border-brand transition-colors">
                                                    {event.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-800">{event.full_name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs font-medium text-gray-500 group-hover:text-gray-700 transition-colors">{event.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded w-fit border border-gray-200/50">
                                                    {event.ip_address || 'IP Interno'}
                                                </span>
                                                {event.user_agent && (
                                                    <span className="text-[9px] text-gray-400 truncate max-w-[200px]" title={event.user_agent}>
                                                        {event.user_agent.split(' ')[0]} {event.user_agent.split(' ').slice(-1)}
                                                    </span>
                                                )}
                                                {event.metadata?.error && (
                                                    <span className="text-[9px] text-red-500 font-bold uppercase tracking-tighter">
                                                        Erro: {event.metadata.error}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col text-right sm:text-left">
                                                <span className="text-xs font-bold text-gray-700">
                                                    {new Date(event.created_at).toLocaleDateString('pt-BR')}
                                                </span>
                                                <span className="text-[10px] font-medium text-gray-400">
                                                    {new Date(event.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}h
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
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
