import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { ProcessService } from '../../services';
import type { Process } from '../../../../types/processes';
import type { Database } from '../../../../types/supabase';

type Department = Database['public']['Tables']['departments']['Row'];
type OrgRole = Database['public']['Tables']['organization_roles']['Row'];

interface ProcessSettingsProps {
    processId: string;
    process: Process;
    readOnly?: boolean;
    onUpdate: (updatedData: Partial<Process>) => void;
}

export const ProcessSettings: React.FC<ProcessSettingsProps> = ({ processId, process, readOnly, onUpdate }) => {
    const [title, setTitle] = useState(process.title || '');
    const [code, setCode] = useState(process.code || '');
    const [description, setDescription] = useState(process.description || '');
    const [departmentId, setDepartmentId] = useState(process.department_id || '');
    const [selectedViewerRoles, setSelectedViewerRoles] = useState<string[]>([]);
    const [selectedEditorRoles, setSelectedEditorRoles] = useState<string[]>([]);
    const [pools, setPools] = useState<string[]>(process.pools || []);
    const [newPool, setNewPool] = useState('');

    const [departments, setDepartments] = useState<Department[]>([]);
    const [roles, setRoles] = useState<OrgRole[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Fetch existing viewer roles for this process
                const existingViewerRoles = await ProcessService.getProcessViewerRoles(processId);
                setSelectedViewerRoles(existingViewerRoles);

                // Fetch existing editor roles for this process
                const existingEditorRoles = await ProcessService.getProcessEditorRoles(processId);
                setSelectedEditorRoles(existingEditorRoles);

                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('organization_id')
                    .eq('id', session.user.id)
                    .single();

                if (profile?.organization_id) {
                    const { data: depts } = await supabase
                        .from('departments')
                        .select('*')
                        .eq('organization_id', profile.organization_id)
                        .eq('is_active', true)
                        .order('name');
                    if (depts) setDepartments(depts);

                    const { data: orgRoles } = await supabase
                        .from('organization_roles')
                        .select('*')
                        .eq('organization_id', profile.organization_id)
                        .eq('is_active', true)
                        .order('name');
                    if (orgRoles) setRoles(orgRoles);
                }
            } catch (err: any) {
                console.error("Error loading process settings data", err);
            } finally {
                setLoadingData(false);
            }
        };

        loadInitialData();
    }, [processId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (readOnly) return;
        setSaving(true);
        setError(null);
        try {
            const updates = {
                title,
                code: code || null,
                description: description || null,
                department_id: departmentId || null,
                pools: pools
            };

            await ProcessService.updateProcess(processId, updates);
            await ProcessService.saveProcessViewerRoles(processId, selectedViewerRoles);
            await ProcessService.saveProcessEditorRoles(processId, selectedEditorRoles);

            onUpdate(updates);
            alert('Configurações salvas com sucesso!');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Erro ao salvar configurações');
        } finally {
            setSaving(false);
        }
    };

    if (loadingData) return <div className="p-8 text-center text-gray-500">Carregando configurações...</div>;

    return (
        <div className="max-w-3xl mx-auto p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Configurações do Processo</h2>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Título *
                    </label>
                    <input
                        type="text"
                        id="title"
                        required
                        disabled={readOnly}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm disabled:opacity-50"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                            Código
                        </label>
                        <input
                            type="text"
                            id="code"
                            disabled={readOnly}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm disabled:opacity-50"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                            Departamento
                        </label>
                        <select
                            id="department"
                            disabled={readOnly}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm disabled:opacity-50"
                            value={departmentId}
                            onChange={(e) => setDepartmentId(e.target.value)}
                        >
                            <option value="">Nenhum departamento</option>
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
                        rows={3}
                        disabled={readOnly}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm disabled:opacity-50"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Piscinas (Pools / Setores Envolvidos)
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            disabled={readOnly}
                            className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm disabled:opacity-50 text-gray-900"
                            placeholder="Ex: Financeiro, Cliente Externo, Fornecedor"
                            value={newPool}
                            onChange={(e) => setNewPool(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (newPool.trim() && !pools.includes(newPool.trim()) && !readOnly) {
                                        setPools([...pools, newPool.trim()]);
                                        setNewPool('');
                                    }
                                }
                            }}
                        />
                        <button
                            type="button"
                            disabled={readOnly}
                            onClick={() => {
                                if (newPool.trim() && !pools.includes(newPool.trim()) && !readOnly) {
                                    setPools([...pools, newPool.trim()]);
                                    setNewPool('');
                                }
                            }}
                            className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            Adicionar
                        </button>
                    </div>
                    {pools.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {pools.map((pool, idx) => (
                                <span key={idx} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${readOnly ? 'bg-gray-100 text-gray-600 border border-gray-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                                    {pool}
                                    {!readOnly && (
                                        <button
                                            type="button"
                                            onClick={() => setPools(pools.filter((_, i) => i !== idx))}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            &times;
                                        </button>
                                    )}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 mt-2">Nenhuma piscina adicionada.</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                        Atores ou setores que farão parte deste fluxo. Estas piscinas estarão disponíveis para selecionar em cada passo no editor.
                    </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Perfis que podem visualizar este processo
                    </label>
                    <div className="border border-gray-300 rounded-md shadow-sm max-h-48 overflow-y-auto p-2 bg-gray-50">
                        {roles.length > 0 ? (
                            <div className="space-y-2">
                                {roles.map(role => (
                                    <label key={role.id} className="flex items-center space-x-3 p-2 hover:bg-white rounded cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            value={role.id}
                                            disabled={readOnly}
                                            checked={selectedViewerRoles.includes(role.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedViewerRoles([...selectedViewerRoles, role.id]);
                                                } else {
                                                    setSelectedViewerRoles(selectedViewerRoles.filter(id => id !== role.id));
                                                }
                                            }}
                                            className="h-4 w-4 text-brand focus:ring-brand border-gray-300 rounded disabled:opacity-50"
                                        />
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-medium ${readOnly ? 'text-gray-500' : 'text-gray-900'}`}>{role.name}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 p-2">Nenhum perfil encontrado.</p>
                        )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        Se nenhum perfil for selecionado, o processo será visível para todos.
                    </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Perfis que podem editar este processo
                    </label>
                    <div className="border border-gray-300 rounded-md shadow-sm max-h-48 overflow-y-auto p-2 bg-gray-50">
                        {roles.length > 0 ? (
                            <div className="space-y-2">
                                {roles.map(role => (
                                    <label key={`editor-${role.id}`} className="flex items-center space-x-3 p-2 hover:bg-white rounded cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            value={role.id}
                                            disabled={readOnly}
                                            checked={selectedEditorRoles.includes(role.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedEditorRoles([...selectedEditorRoles, role.id]);
                                                } else {
                                                    setSelectedEditorRoles(selectedEditorRoles.filter(id => id !== role.id));
                                                }
                                            }}
                                            className="h-4 w-4 text-brand focus:ring-brand border-gray-300 rounded disabled:opacity-50"
                                        />
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-medium ${readOnly ? 'text-gray-500' : 'text-gray-900'}`}>{role.name}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 p-2">Nenhum perfil encontrado.</p>
                        )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        Selecione os perfis que terão permissão para editar este processo (além dos administradores e daqueles com permissão global).
                    </p>
                </div>

                {!readOnly && (
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50"
                        >
                            {saving ? 'Salvando...' : 'Salvar Configurações'}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};
