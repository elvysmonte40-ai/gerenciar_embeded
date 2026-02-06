import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { OrganizationRole } from '../../../types/dashboard';
import RoleForm from './RoleForm';

export default function RoleList() {
    const [roles, setRoles] = useState<OrganizationRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<OrganizationRole | null>(null);
    const [dashboardCounts, setDashboardCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();

            if (profile?.organization_id) {
                const { data, error } = await supabase
                    .from('organization_roles')
                    .select('*')
                    .eq('organization_id', profile.organization_id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setRoles(data || []);

                // Fetch counts
                // Since we can't easily do a join count in one query without a view/function or specific PostgREST syntax that might fail if not configured
                // We'll just fetch all junction rows for this org's roles.
                // Or simplified: fetch counts for each role.

                if (data && data.length > 0) {
                    const roleIds = data.map(r => r.id);
                    const { data: junctionData } = await supabase
                        .from('organization_role_dashboards')
                        .select('organization_role_id')
                        .in('organization_role_id', roleIds);

                    if (junctionData) {
                        const counts: Record<string, number> = {};
                        junctionData.forEach((row: any) => {
                            counts[row.organization_role_id] = (counts[row.organization_role_id] || 0) + 1;
                        });
                        setDashboardCounts(counts);
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
        if (!confirm('Tem certeza que deseja excluir este perfil?')) return;

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Perfis de Acesso</h2>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand"
                >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Novo Perfil
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome / Descrição</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Dashboards</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Exportar Dados</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {roles.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500 text-sm">
                                        Nenhum perfil cadastrado.
                                    </td>
                                </tr>
                            ) : (
                                roles.map((role) => (
                                    <tr key={role.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{role.name}</div>
                                            {role.description && <div className="text-sm text-gray-500">{role.description}</div>}
                                            {role.pbi_roles && <div className="text-xs text-brand font-mono mt-1 bg-brand-light/20 inline-block px-1 rounded">Roles: {role.pbi_roles}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {dashboardCounts[role.id] || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                            {role.can_export_data ? (
                                                <span className="text-green-600 font-semibold text-xs">Sim</span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">Não</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleStatus(role)}
                                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${role.is_active ? 'bg-green-500' : 'bg-gray-200'}`}
                                            >
                                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${role.is_active ? 'translate-x-5' : 'translate-x-0'}`}></span>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-medium">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => handleEdit(role)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(role.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Excluir
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
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
