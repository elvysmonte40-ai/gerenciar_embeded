import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { ProcessService } from '../../services';
import type { Database } from '../../../../types/supabase';
import { fetchUserPermissions, hasPermission } from '../../../../utils/permissions';

type Department = Database['public']['Tables']['departments']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export const ProcessCreate: React.FC = () => {
    const [title, setTitle] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [departmentId, setDepartmentId] = useState('');

    const [departments, setDepartments] = useState<Department[]>([]);
    const [users, setUsers] = useState<Profile[]>([]);
    const [selectedApprovers, setSelectedApprovers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Permission Check
            const { permissions, isOrgAdmin } = await fetchUserPermissions(session.user.id);
            if (!hasPermission(permissions, 'processes', 'create', isOrgAdmin)) {
                window.location.href = '/processes';
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', session.user.id)
                .single();

            if (profile?.organization_id) {
                // Load Departments
                const { data: depts } = await supabase
                    .from('departments')
                    .select('*')
                    .eq('organization_id', profile.organization_id)
                    .eq('is_active', true)
                    .order('name');

                if (depts) setDepartments(depts);

                // Load Users (Potential Approvers)
                const { data: orgUsers } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('organization_id', profile.organization_id)
                    .neq('id', session.user.id) // Optional: exclude self if creator cannot be approver, or keep. 
                    // Usually creators can't approve their own work in strict workflows, but let's allow flexibility or filter.
                    // Let's filter out self for now to avoid confusion, or keep it. 
                    // The user didn't specify. I'll include everyone for now but maybe sort by name.
                    .order('full_name');

                if (orgUsers) setUsers(orgUsers);
            }
        };
        loadData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Usuário não autenticado");

            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
            if (!profile?.organization_id) throw new Error("Organização não encontrada");

            const { process, version } = await ProcessService.createProcess({
                title,
                code: code || null,
                description: description || null,
                department_id: departmentId || null,
                organization_id: profile.organization_id,
                created_by: session.user.id
            });

            // Add Approvers
            if (selectedApprovers.length > 0) {
                await Promise.all(selectedApprovers.map(userId =>
                    ProcessService.addApprover(version.id, userId)
                ));
            }

            // Redirect to Editor
            window.location.href = `/processes/${process.id}/editar`;

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Erro ao criar processo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Novo Processo</h2>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Título do Processo *
                    </label>
                    <input
                        type="text"
                        id="title"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                            Código (Opcional)
                        </label>
                        <input
                            type="text"
                            id="code"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Ex: PROC-001"
                        />
                    </div>

                    <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                            Departamento
                        </label>
                        <select
                            id="department"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                            value={departmentId}
                            onChange={(e) => setDepartmentId(e.target.value)}
                        >
                            <option value="">Selecione um departamento...</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Descrição
                    </label>
                    <textarea
                        id="description"
                        rows={4}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aprovadores
                    </label>
                    <div className="border border-gray-300 rounded-md shadow-sm max-h-48 overflow-y-auto p-2 bg-gray-50">
                        {users.length > 0 ? (
                            <div className="space-y-2">
                                {users.map(user => (
                                    <label key={user.id} className="flex items-center space-x-3 p-2 hover:bg-white rounded cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            value={user.id}
                                            checked={selectedApprovers.includes(user.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedApprovers([...selectedApprovers, user.id]);
                                                } else {
                                                    setSelectedApprovers(selectedApprovers.filter(id => id !== user.id));
                                                }
                                            }}
                                            className="h-4 w-4 text-brand focus:ring-brand border-gray-300 rounded"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900">{user.full_name || 'Sem nome'}</span>
                                            <span className="text-xs text-gray-500">{user.job_title || user.email}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 p-2">Nenhum outro usuário encontrado na organização.</p>
                        )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        Selecione quem será responsável por aprovar as versões deste processo.
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <a
                        href="/processes"
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand"
                    >
                        Cancelar
                    </a>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50"
                    >
                        {loading ? 'Criando...' : 'Criar Processo'}
                    </button>
                </div>
            </form>
        </div>
    );
};
