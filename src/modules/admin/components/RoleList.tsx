import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { OrganizationRole } from '../../../types/dashboard';
import RoleForm from './RoleForm';
import { fetchUserPermissions, hasPermission } from '../../../utils/permissions';
import type { AppPermissions } from '../../../types/dashboard';

export default function RoleList() {
    const [roles, setRoles] = useState<OrganizationRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<OrganizationRole | null>(null);
    const [dashboardCounts, setDashboardCounts] = useState<Record<string, number>>({});
    const [jobTitleCounts, setJobTitleCounts] = useState<Record<string, number>>({});
    const [userCounts, setUserCounts] = useState<Record<string, number>>({});

    // Permission State
    const [permissions, setPermissions] = useState<AppPermissions | null>(null);
    const [isOrgAdmin, setIsOrgAdmin] = useState(false);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const perms = await fetchUserPermissions(session.user.id);
            setPermissions(perms.permissions);
            setIsOrgAdmin(perms.isOrgAdmin);

            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();

            if (profile?.organization_id) {
                const { data, error } = await supabase
                    .from('organization_roles')
                    .select('*')
                    .eq('organization_id', profile.organization_id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setRoles(data || []);

                if (data && data.length > 0) {
                    const roleIds = data.map(r => r.id);

                    // Dashboard counts
                    const { data: dashData } = await supabase
                        .from('organization_role_dashboards')
                        .select('organization_role_id')
                        .in('organization_role_id', roleIds);

                    if (dashData) {
                        const counts: Record<string, number> = {};
                        dashData.forEach((row: any) => {
                            counts[row.organization_role_id] = (counts[row.organization_role_id] || 0) + 1;
                        });
                        setDashboardCounts(counts);
                    }

                    // Job title counts
                    const { data: jtData } = await supabase
                        .from('organization_role_job_titles')
                        .select('organization_role_id')
                        .in('organization_role_id', roleIds);

                    if (jtData) {
                        const counts: Record<string, number> = {};
                        jtData.forEach((row: any) => {
                            counts[row.organization_role_id] = (counts[row.organization_role_id] || 0) + 1;
                        });
                        setJobTitleCounts(counts);
                    }

                    // User counts per role
                    const { data: userData } = await supabase
                        .from('profiles')
                        .select('organization_role_id')
                        .eq('organization_id', profile.organization_id)
                        .in('organization_role_id', roleIds);

                    if (userData) {
                        const counts: Record<string, number> = {};
                        userData.forEach((row: any) => {
                            if (row.organization_role_id) {
                                counts[row.organization_role_id] = (counts[row.organization_role_id] || 0) + 1;
                            }
                        });
                        setUserCounts(counts);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching roles:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (role: OrganizationRole) => {
        setSelectedRole(role);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este perfil? Os usuários associados perderão o vínculo.')) return;

        try {
            const { error } = await supabase
                .from('organization_roles')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchRoles();
        } catch (error) {
            console.error("Error deleting role:", error);
            alert("Erro ao excluir perfil. Verifique se existem usuários vinculados.");
        }
    };

    const handleToggleStatus = async (role: OrganizationRole) => {
        try {
            const { error } = await supabase
                .from('organization_roles')
                .update({ is_active: !role.is_active })
                .eq('id', role.id);

            if (error) throw error;
            fetchRoles();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const openCreateModal = () => {
        setSelectedRole(null);
        setIsFormOpen(true);
    };

    const canManage = hasPermission(permissions, 'organization', 'manage_settings', isOrgAdmin);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-medium text-gray-900">Perfis de Acesso</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Gerencie permissões e vincule cargos aos perfis.</p>
                </div>
                {canManage && (
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors"
                    >
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Novo Perfil
                    </button>
                )}
            </div>

            {loading ? (
                <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
                </div>
            ) : (
                <div className="bg-white shadow-sm overflow-hidden rounded-xl border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfil</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Cargos</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Usuários</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Dashboards</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Exportar</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {roles.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm text-gray-500">Nenhum perfil cadastrado.</p>
                                            {canManage && (
                                                <button
                                                    onClick={openCreateModal}
                                                    className="text-sm font-medium text-brand hover:text-brand-dark transition-colors"
                                                >
                                                    + Criar primeiro perfil
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                roles.map((role) => {
                                    const roleColor = role.color || '#3B82F6';
                                    return (
                                        <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-2.5 h-8 rounded-full shrink-0"
                                                        style={{ backgroundColor: roleColor }}
                                                    />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{role.name}</div>
                                                        {role.description && <div className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">{role.description}</div>}
                                                        {role.pbi_roles && (
                                                            <div className="text-xs font-mono mt-1 inline-block px-1.5 py-0.5 rounded" style={{ backgroundColor: `${roleColor}15`, color: roleColor }}>
                                                                Roles: {role.pbi_roles}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <span
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                                    style={{
                                                        backgroundColor: jobTitleCounts[role.id] ? `${roleColor}15` : '#F3F4F6',
                                                        color: jobTitleCounts[role.id] ? roleColor : '#9CA3AF',
                                                    }}
                                                >
                                                    {jobTitleCounts[role.id] || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                    {userCounts[role.id] || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                    {dashboardCounts[role.id] || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
                                                {role.can_export_data ? (
                                                    <span className="text-green-600 font-semibold text-xs">Sim</span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">Não</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <button
                                                    onClick={() => canManage && handleToggleStatus(role)}
                                                    disabled={!canManage}
                                                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${role.is_active ? 'bg-green-500' : 'bg-gray-200'} ${!canManage ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                                >
                                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${role.is_active ? 'translate-x-5' : 'translate-x-0'}`}></span>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    {canManage && (
                                                        <button
                                                            onClick={() => handleEdit(role)}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-brand hover:bg-brand/5 transition-colors"
                                                            title="Editar"
                                                        >
                                                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                    {canManage && (
                                                        <button
                                                            onClick={() => handleDelete(role.id)}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                            title="Excluir"
                                                        >
                                                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <RoleForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => {
                    fetchRoles();
                }}
                role={selectedRole}
            />
        </div>
    );
}
