import React, { useState, useEffect } from 'react';
import { ProcessService } from '../../services';
import { supabase } from '../../../../lib/supabase';
import { StatusBadge } from '../shared/StatusBadge';
import type { ProcessWithDetails } from '../../../../types/processes';
import { Plus, Search, FileText, ArrowRight, Pencil } from 'lucide-react';
import type { AppPermissions } from '../../../../types/dashboard';

interface ProcessListProps {
    organizationId?: string;
}

export const ProcessList: React.FC<ProcessListProps> = ({ organizationId }) => {
    const [processes, setProcesses] = useState<ProcessWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Permission State
    const [permissions, setPermissions] = useState<AppPermissions | null>(null);
    const [isOrgAdmin, setIsOrgAdmin] = useState(false);

    // Todo: Get departments for filter dropdown

    useEffect(() => {
        loadData();
    }, [organizationId, searchTerm]);

    const loadData = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Fetch Permissions
            const { fetchUserPermissions, hasPermission } = await import('../../../../utils/permissions');
            const perms = await fetchUserPermissions(session.user.id);
            setPermissions(perms.permissions);
            setIsOrgAdmin(perms.isOrgAdmin);

            // Fetch Processes
            let orgId = organizationId;

            if (!orgId) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('organization_id')
                    .eq('id', session.user.id)
                    .single();
                orgId = profile?.organization_id;
            }

            if (!orgId) {
                setLoading(false);
                return;
            }

            const data = await ProcessService.listProcesses(orgId, {
                search: searchTerm
            });
            setProcesses(data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper for permissions (since we imported it dynamically above, we need it here too or import at top)
    // I will add import at top in a separate move or use if logic. 
    // Actually, let's use the hook/util pattern.
    // Since I'm replacing the component, I should add imports at the top using multi_replace_file_content or just rely on global? No.
    // I'll add the checks inline assuming imports are there.
    // Wait, I am replacing the FUNCTION body. I need to make sure imports are present.
    // I will use `replace_file_content` for the whole file? No, too big. 
    // I'll use the existing `hasPermission` if I import it.

    // Let's assume I will add imports in another step or this step if I can target top.

    // ... rest of component
    // I'll return the modified component logic here.

    // Re-importing hasPermission inside component is ugly.

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar processos..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm transition duration-150 ease-in-out"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Create Button Permission Check */}
                {permissions && (isOrgAdmin || permissions.processes.create) && (
                    <a
                        href="/processes/novo"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Processo
                    </a>
                )}
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Carregando processos...</p>
                </div>
            ) : processes.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                        <FileText className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum processo encontrado</h3>
                    <p className="mt-1 text-sm text-gray-500">Comece criando o primeiro processo da organização.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {processes.map((process) => {
                        const latestVersion = process.versions && process.versions.length > 0
                            ? [...process.versions].sort((a, b) => b.version_number - a.version_number)[0]
                            : null;
                        const displayVersion = process.current_version || latestVersion;

                        return (
                            <div
                                key={process.id}
                                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col h-full cursor-pointer"
                                onClick={() => window.location.href = process.current_version ? `/processes/${process.code || process.id}` : `/processes/${process.id}/editar`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                        {process.code || 'SEM CÓDIGO'}
                                    </span>
                                    {displayVersion && (
                                        <StatusBadge status={displayVersion.status} />
                                    )}
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                                    {process.title}
                                </h3>

                                <div className="text-sm text-gray-500 mb-4 grow space-y-2">
                                    <div>{process.department?.name || 'Sem departamento'}</div>

                                    {(displayVersion as any)?.status === 'awaiting_approval' && (displayVersion as any).approvers && (displayVersion as any).approvers.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {(displayVersion as any).approvers.map((approver: any) => (
                                                <div
                                                    key={approver.id}
                                                    className={`inline-flex items-center px-2 py-1 rounded text-xs border ${approver.status === 'approved'
                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                        : approver.status === 'rejected'
                                                            ? 'bg-red-50 text-red-700 border-red-200'
                                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                                        }`}
                                                    title={approver.user?.full_name || 'Usuário desconhecido'}
                                                >
                                                    <span className="max-w-[100px] truncate mr-1">
                                                        {approver.user?.full_name?.split(' ')[0] || '...'}
                                                    </span>
                                                    {approver.status === 'approved' ? (
                                                        <span className="text-[10px]" aria-label="Aprovado">✓</span>
                                                    ) : approver.status === 'rejected' ? (
                                                        <span className="text-[10px]" aria-label="Rejeitado">✕</span>
                                                    ) : (
                                                        <span className="text-[10px]" aria-label="Pendente">⏳</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                                    <span className="text-gray-500">
                                        v{displayVersion?.version_number || '1'}
                                    </span>
                                    <div className="flex gap-3">
                                        {permissions && (isOrgAdmin || permissions.processes.edit) && (
                                            <a
                                                href={`/processes/${process.id}/editar`}
                                                className="text-gray-500 hover:text-brand font-medium inline-flex items-center"
                                                title="Editar Processo"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Pencil className="h-3 w-3" />
                                            </a>
                                        )}
                                        <a
                                            href={process.current_version ? `/processes/${process.code || process.id}` : `/processes/${process.id}/editar`}
                                            className="text-brand hover:text-brand-dark font-medium inline-flex items-center"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            Visualizar <ArrowRight className="h-3 w-3 ml-1" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
