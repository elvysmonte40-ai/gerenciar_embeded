import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { OrganizationDashboard } from '../../../types/dashboard';
import DashboardForm from './DashboardForm';

export default function DashboardList() {
    const [dashboards, setDashboards] = useState<OrganizationDashboard[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDashboard, setEditingDashboard] = useState<OrganizationDashboard | null>(null);

    const fetchDashboards = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) return;

            // Get user's org
            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', session.user.id)
                .single();

            if (!profile?.organization_id) return;

            const { data, error } = await supabase
                .from('organization_dashboards')
                .select('*')
                .eq('organization_id', profile.organization_id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDashboards(data || []);
        } catch (error) {
            console.error("Error fetching dashboards:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboards();
    }, []);

    const handleAdd = () => {
        setEditingDashboard(null);
        setIsFormOpen(true);
    };

    const handleEdit = (dashboard: OrganizationDashboard) => {
        setEditingDashboard(dashboard);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir o dashboard "${name}"?`)) return;

        try {
            const { error } = await supabase
                .from('organization_dashboards')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setDashboards(dashboards.filter(d => d.id !== id));
        } catch (error) {
            console.error("Error deleting dashboard:", error);
            alert("Erro ao excluir dashboard");
        }
    };

    const handleFormSuccess = () => {
        fetchDashboards();
    };

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                            </svg>
                            Meus Dashboards
                        </h2>
                        <p className="text-xs text-text-secondary mt-1">
                            Gerencie os relatórios disponíveis para seus usuários.
                        </p>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors"
                    >
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Novo Dashboard
                    </button>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-6 text-center text-gray-500 text-sm">Carregando...</div>
                    ) : dashboards.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 text-sm">
                            Nenhum dashboard cadastrado. Clique em "Novo Dashboard" para começar.
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IDs (Workspace/Report)</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acesso</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dashboards.map((dashboard) => (
                                    <tr key={dashboard.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-text-primary">{dashboard.name}</div>
                                            {dashboard.description && (
                                                <div className="text-xs text-gray-500">{dashboard.description}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-gray-500">
                                                <span><span className="font-semibold">W:</span> {dashboard.workspace_id}</span>
                                                <span className="hidden sm:inline text-gray-300">|</span>
                                                <span><span className="font-semibold">R:</span> {dashboard.report_id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {dashboard.allowed_groups ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {dashboard.allowed_groups}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    Todos
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleEdit(dashboard)} className="text-brand hover:text-brand-dark mr-4">Editar</button>
                                            <button onClick={() => handleDelete(dashboard.id, dashboard.name)} className="text-red-600 hover:text-red-900">Excluir</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <DashboardForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={handleFormSuccess}
                dashboard={editingDashboard}
            />
        </>
    );
}
