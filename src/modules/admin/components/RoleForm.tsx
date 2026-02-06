import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../../lib/supabase';
import type { OrganizationRole, OrganizationDashboard } from '../../../types/dashboard';

interface RoleFormProps {
    role?: OrganizationRole | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RoleForm({ role, isOpen, onClose, onSuccess }: RoleFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    // Data Sources
    const [dashboards, setDashboards] = useState<OrganizationDashboard[]>([]);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [pbiRoles, setPbiRoles] = useState('');
    const [canExportData, setCanExportData] = useState(false);
    const [selectedDashboardIds, setSelectedDashboardIds] = useState<string[]>([]);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchDashboards();
            if (role) {
                // Edit Mode
                setName(role.name);
                setDescription(role.description || '');
                setPbiRoles(role.pbi_roles || '');
                setCanExportData(role.can_export_data);

                // Fetch assigned dashboards
                fetchRoleDashboards(role.id);
            } else {
                // Create Mode
                setName('');
                setDescription('');
                setPbiRoles('');
                setCanExportData(false);
                setSelectedDashboardIds([]);
            }
            setError(null);
        }
    }, [isOpen, role]);

    const fetchDashboards = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
                if (profile?.organization_id) {
                    const { data } = await supabase
                        .from('organization_dashboards')
                        .select('*')
                        .eq('organization_id', profile.organization_id);
                    if (data) setDashboards(data);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchRoleDashboards = async (roleId: string) => {
        try {
            const { data } = await supabase
                .from('organization_role_dashboards')
                .select('dashboard_id')
                .eq('organization_role_id', roleId);

            if (data) {
                setSelectedDashboardIds(data.map(d => d.dashboard_id));
            }
        } catch (err) {
            console.error(err);
        }
    }

    const handleDashboardToggle = (dashboardId: string) => {
        setSelectedDashboardIds(prev => {
            if (prev.includes(dashboardId)) {
                return prev.filter(id => id !== dashboardId);
            } else {
                return [...prev, dashboardId];
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Usuário não autenticado");

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', session.user.id)
                .single();

            if (!profile?.organization_id) throw new Error("Organização não encontrada");

            // 1. Upsert Role
            const rolePayload = {
                organization_id: profile.organization_id,
                name,
                description,
                pbi_roles: pbiRoles || null,
                can_export_data: canExportData,
                updated_at: new Date().toISOString(),
            };

            let savedRoleId = role?.id;

            if (role?.id) {
                // Update
                const { error: updateError } = await supabase
                    .from('organization_roles')
                    .update(rolePayload)
                    .eq('id', role.id);
                if (updateError) throw updateError;
            } else {
                // Insert
                const { data: insertedRole, error: insertError } = await supabase
                    .from('organization_roles')
                    .insert(rolePayload)
                    .select()
                    .single();

                if (insertError) throw insertError;
                savedRoleId = insertedRole.id;
            }

            if (!savedRoleId) throw new Error("Erro ao salvar perfil");

            // 2. Update Role Dashboards (Delete all, then insert selected)
            // Ideally we'd compare diffs, but simple delete-all-insert is easier for now given low volume.

            // Delete existing
            const { error: deleteError } = await supabase
                .from('organization_role_dashboards')
                .delete()
                .eq('organization_role_id', savedRoleId);

            if (deleteError) throw deleteError;

            // Insert new
            if (selectedDashboardIds.length > 0) {
                const junctionPayload = selectedDashboardIds.map(dashboardId => ({
                    organization_role_id: savedRoleId!,
                    dashboard_id: dashboardId
                }));

                const { error: junctionError } = await supabase
                    .from('organization_role_dashboards')
                    .insert(junctionPayload);

                if (junctionError) throw junctionError;
            }

            onSuccess();
            onClose();

        } catch (err: any) {
            console.error("Error saving role:", err);
            setError(err.message || "Erro ao salvar perfil");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="relative z-9999" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        {role ? 'Editar Perfil' : 'Novo Perfil'}
                                    </h3>

                                    <div className="mt-4">
                                        <form id="role-form" onSubmit={handleSubmit} className="space-y-6">
                                            {/* Basic Info */}
                                            <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
                                                <div>
                                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Perfil</label>
                                                    <input
                                                        type="text"
                                                        id="name"
                                                        required
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                                        value={name}
                                                        onChange={e => setName(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="pbiRoles" className="block text-sm font-medium text-gray-700">Papéis Power BI (Roles)</label>
                                                    <input
                                                        type="text"
                                                        id="pbiRoles"
                                                        placeholder="ex: Sales, Manager (separados por vírgula)"
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                                        value={pbiRoles}
                                                        onChange={e => setPbiRoles(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                                                <textarea
                                                    id="description"
                                                    rows={2}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                                    value={description}
                                                    onChange={e => setDescription(e.target.value)}
                                                />
                                            </div>

                                            {/* Export Toggle */}
                                            <div className="flex items-center justify-between py-2 border-b border-gray-100 pb-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900">Exportar Dados</span>
                                                    <span className="text-xs text-gray-500">Permitir que usuários deste perfil exportem dados do Power BI</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className={`${canExportData ? 'bg-brand' : 'bg-gray-200'} relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2`}
                                                    role="switch"
                                                    aria-checked={canExportData}
                                                    onClick={() => setCanExportData(!canExportData)}
                                                >
                                                    <span className={`${canExportData ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                                                </button>
                                            </div>

                                            {/* Dashboards Selection */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Dashboards Permitidos</label>
                                                <div className="border border-gray-300 rounded-md max-h-60 overflow-y-auto divide-y divide-gray-100 bg-gray-50">
                                                    {dashboards.length === 0 ? (
                                                        <div className="p-4 text-sm text-gray-500 text-center">Nenhum dashboard disponível.</div>
                                                    ) : (
                                                        dashboards.map(dash => (
                                                            <div key={dash.id} className="relative flex items-start px-4 py-3 hover:bg-white transition-colors">
                                                                <div className="min-w-0 flex-1 text-sm">
                                                                    <label htmlFor={`dash-${dash.id}`} className="font-medium text-gray-700 select-none cursor-pointer block">
                                                                        {dash.name}
                                                                        {dash.description && <span className="block text-gray-500 text-xs font-normal mt-0.5">{dash.description}</span>}
                                                                    </label>
                                                                </div>
                                                                <div className="ml-3 flex h-5 items-center">
                                                                    <input
                                                                        id={`dash-${dash.id}`}
                                                                        name={`dash-${dash.id}`}
                                                                        type="checkbox"
                                                                        className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                                                                        checked={selectedDashboardIds.includes(dash.id)}
                                                                        onChange={() => handleDashboardToggle(dash.id)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                                <p className="mt-2 text-xs text-gray-500 text-right">
                                                    {selectedDashboardIds.length} dashboards selecionados
                                                </p>
                                            </div>

                                            {error && (
                                                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-100">{error}</div>
                                            )}
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                form="role-form"
                                disabled={loading}
                                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand text-base font-medium text-white hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand sm:ml-3 sm:w-auto sm:text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Salvando...' : 'Salvar'}
                            </button>
                            <button
                                type="button"
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                onClick={onClose}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
