import React, { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';

interface JobTitle {
    id: string;
    title: string;
    description: string;
    is_active: boolean;
    created_at: string;
    organization_id: string;
    created_by?: string;
    creator?: {
        full_name: string;
    };
    sector_id?: string;
    sector?: {
        name: string;
    };
    department_id?: string;
    department?: {
        name: string;
    };
    work_schedule?: string;
    work_model?: 'Presencial' | 'Híbrido' | 'Remoto';
    salary_min?: number;
    salary_max?: number;
    seniority_level?: string;
    cbo_code?: string;
    schedule_type?: string;
    requirements?: string;
}

interface Department {
    id: string;
    name: string;
}

interface Sector {
    id: string;
    name: string;
    department_id: string;
}

export default function JobTitleList() {
    const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTitle, setEditingTitle] = useState<JobTitle | null>(null);

    const [sectors, setSectors] = useState<Sector[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [sectorId, setSectorId] = useState('');
    const [workSchedule, setWorkSchedule] = useState('');
    const [workModel, setWorkModel] = useState('');
    const [salaryMin, setSalaryMin] = useState('');
    const [salaryMax, setSalaryMax] = useState('');
    const [seniorityLevel, setSeniorityLevel] = useState('');
    const [scheduleType, setScheduleType] = useState('');
    const [cboCode, setCboCode] = useState('');
    const [requirements, setRequirements] = useState('');

    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        fetchJobTitles();
        fetchDepartments();
        fetchSectors();
    }, []);

    useEffect(() => {
        if (isModalOpen) {
            if (editingTitle) {
                setTitle(editingTitle.title);
                setDescription(editingTitle.description || '');
                setDepartmentId(editingTitle.department_id || '');
                setSectorId(editingTitle.sector_id || '');
                setWorkSchedule(editingTitle.work_schedule || '');
                setWorkModel(editingTitle.work_model || '');
                setSalaryMin(editingTitle.salary_min?.toString() || '');
                setSalaryMax(editingTitle.salary_max?.toString() || '');
                setSeniorityLevel(editingTitle.seniority_level || '');
                setScheduleType(editingTitle.schedule_type || '');
                setCboCode(editingTitle.cbo_code || '');
                setRequirements(editingTitle.requirements || '');
            } else {
                setTitle('');
                setDescription('');
                setDepartmentId('');
                setSectorId('');
                setWorkSchedule('');
                setWorkModel('');
                setSalaryMin('');
                setSalaryMax('');
                setSeniorityLevel('');
                setScheduleType('');
                setCboCode('');
                setRequirements('');
            }
        }
    }, [isModalOpen, editingTitle]);

    const fetchJobTitles = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const orgId = session.user.user_metadata.organization_id;

            const { data, error } = await supabase
                .from('job_titles')
                .select('*, creator:profiles!created_by(full_name), sector:sectors(name)')
                .eq('organization_id', orgId)
                .order('title');

            if (error) throw error;
            setJobTitles(data || []);
        } catch (err: any) {
            console.error('Error fetching job titles:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const orgId = session.user.user_metadata.organization_id;

            const { data, error } = await supabase
                .from('departments')
                .select('id, name')
                .eq('organization_id', orgId)
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            setDepartments(data || []);
        } catch (err: any) {
            console.error('Error fetching departments:', err);
        }
    };

    const fetchSectors = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const orgId = session.user.user_metadata.organization_id;

            const { data, error } = await supabase
                .from('sectors')
                .select('id, name, department_id')
                .eq('organization_id', orgId)
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            setSectors(data || []);
        } catch (err: any) {
            console.error('Error fetching sectors:', err);
        }
    };

    const handleCboChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 6) value = value.slice(0, 6);

        if (value.length > 4) {
            value = value.replace(/(\d{4})(\d{1,2})/, '$1-$2');
        }

        setCboCode(value);
    };

    const handleWorkScheduleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow only numbers
        const value = e.target.value.replace(/\D/g, '');
        setWorkSchedule(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No session");
            const orgId = session.user.user_metadata.organization_id;

            const payload = {
                title,
                description,
                department_id: departmentId || null,
                sector_id: sectorId || null,
                work_schedule: workSchedule || null,
                work_model: workModel || null,
                salary_min: salaryMin ? parseFloat(salaryMin) : null,
                salary_max: salaryMax ? parseFloat(salaryMax) : null,
                seniority_level: seniorityLevel || null,
                schedule_type: scheduleType || null,
                cbo_code: cboCode || null,
                requirements: requirements || null,
            };

            if (editingTitle) {
                const { error } = await supabase
                    .from('job_titles')
                    .update(payload)
                    .eq('id', editingTitle.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('job_titles')
                    .insert({
                        ...payload,
                        organization_id: orgId,
                        created_by: session.user.id
                    });
                if (error) throw error;
            }

            setIsModalOpen(false);
            fetchJobTitles();
        } catch (err: any) {
            alert('Error saving: ' + err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleToggleStatus = async (job: JobTitle) => {
        if (!confirm(`Deseja ${job.is_active ? 'inativar' : 'ativar'} este cargo?`)) return;
        try {
            const { error } = await supabase
                .from('job_titles')
                .update({ is_active: !job.is_active })
                .eq('id', job.id);
            if (error) throw error;
            fetchJobTitles();
        } catch (err: any) {
            alert('Error updating status: ' + err.message);
        }
    };

    const formatCurrency = (value?: number) => {
        if (!value) return '-';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    if (loading) return <div className="p-4">Carregando...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Cargos</h2>
                <button
                    onClick={() => { setEditingTitle(null); setIsModalOpen(true); }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand"
                >
                    Novo Cargo
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo / Nível</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Setor</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo / Jornada</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faixa Salarial</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {jobTitles.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Nenhum cargo cadastrado.</td>
                                </tr>
                            )}
                            {jobTitles.map((job) => (
                                <tr key={job.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-brand">{job.title}</div>
                                        {job.seniority_level && <div className="text-xs text-gray-500">{job.seniority_level}</div>}
                                        {job.cbo_code && <div className="text-xs text-gray-400">CBO: {job.cbo_code}</div>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-700">{job.sector?.name || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-700">{job.work_model || '-'}</div>
                                        <div className="text-xs text-gray-500">
                                            {job.work_schedule ? `${job.work_schedule}h/sem` : '-'}
                                            {job.schedule_type ? ` (${job.schedule_type})` : ''}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-700">
                                            {job.salary_min ? formatCurrency(job.salary_min) : ''}
                                            {job.salary_min && job.salary_max ? ' - ' : ''}
                                            {job.salary_max ? formatCurrency(job.salary_max) : ''}
                                            {!job.salary_min && !job.salary_max && '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${job.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {job.is_active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                className="text-brand hover:text-brand-dark"
                                                title="Editar"
                                                onClick={() => { setEditingTitle(job); setIsModalOpen(true); }}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(job)}
                                                className="text-red-600 hover:text-red-900"
                                                title={job.is_active ? "Inativar" : "Ativar"}
                                            >
                                                {job.is_active ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>

                        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                                        {editingTitle ? 'Editar Cargo' : 'Novo Cargo'}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        {/* Coluna Esquerda */}
                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título do Cargo</label>
                                                <input
                                                    type="text"
                                                    id="title"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                                    value={title}
                                                    onChange={e => setTitle(e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="department" className="block text-sm font-medium text-gray-700">Departamento</label>
                                                <select
                                                    id="department"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                                    value={departmentId}
                                                    onChange={e => {
                                                        setDepartmentId(e.target.value);
                                                        setSectorId('');
                                                    }}
                                                >
                                                    <option value="">Selecione...</option>
                                                    {departments.map(dept => (
                                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label htmlFor="sector" className="block text-sm font-medium text-gray-700">Setor</label>
                                                <select
                                                    id="sector"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                                    value={sectorId}
                                                    onChange={e => {
                                                        const selectedSectorId = e.target.value;
                                                        setSectorId(selectedSectorId);
                                                        // Auto-select department if sector selected
                                                        if (selectedSectorId) {
                                                            const sector = sectors.find(s => s.id === selectedSectorId);
                                                            if (sector && sector.department_id) {
                                                                setDepartmentId(sector.department_id);
                                                            }
                                                        }
                                                    }}
                                                    disabled={!departmentId}
                                                >
                                                    <option value="">Sem setor específico</option>
                                                    {sectors
                                                        .filter(s => !departmentId || s.department_id === departmentId)
                                                        .map(sector => (
                                                            <option key={sector.id} value={sector.id}>{sector.name}</option>
                                                        ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label htmlFor="seniority" className="block text-sm font-medium text-gray-700">Nível de Senioridade</label>
                                                <select
                                                    id="seniority"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                                    value={seniorityLevel}
                                                    onChange={e => setSeniorityLevel(e.target.value)}
                                                >
                                                    <option value="">Selecione...</option>
                                                    <option value="Estagiário">Estagiário</option>
                                                    <option value="Jovem Aprendiz">Jovem Aprendiz</option>
                                                    <option value="Auxiliar">Auxiliar</option>
                                                    <option value="Assistente">Assistente</option>
                                                    <option value="Analista Jr">Analista Jr</option>
                                                    <option value="Analista Pl">Analista Pl</option>
                                                    <option value="Analista Sr">Analista Sr</option>
                                                    <option value="Especialista">Especialista</option>
                                                    <option value="Coordenador">Coordenador</option>
                                                    <option value="Gerente">Gerente</option>
                                                    <option value="Diretor">Diretor</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label htmlFor="cbo" className="block text-sm font-medium text-gray-700">CBO</label>
                                                <input
                                                    type="text"
                                                    id="cbo"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                                    value={cboCode}
                                                    onChange={handleCboChange}
                                                    placeholder="0000-00"
                                                    maxLength={7}
                                                />
                                            </div>
                                        </div>

                                        {/* Coluna Direita */}
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="workModel" className="block text-sm font-medium text-gray-700">Modelo</label>
                                                    <select
                                                        id="workModel"
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                                        value={workModel}
                                                        onChange={e => setWorkModel(e.target.value)}
                                                    >
                                                        <option value="">Selecione...</option>
                                                        <option value="Presencial">Presencial</option>
                                                        <option value="Híbrido">Híbrido</option>
                                                        <option value="Remoto">Remoto</option>
                                                        <option value="Remoto">Remoto</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label htmlFor="scheduleType" className="block text-sm font-medium text-gray-700">Escala de Trabalho</label>
                                                    <select
                                                        id="scheduleType"
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                                        value={scheduleType}
                                                        onChange={e => setScheduleType(e.target.value)}
                                                    >
                                                        <option value="">Selecione...</option>
                                                        <option value="5x2">5x2</option>
                                                        <option value="6x1">6x1</option>
                                                        <option value="12x36">12x36</option>
                                                        <option value="24x48">24x48</option>
                                                        <option value="Outra">Outra</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="workSchedule" className="block text-sm font-medium text-gray-700">Carga Horária Semanal (horas)</label>
                                                <input
                                                    type="text"
                                                    id="workSchedule"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                                    value={workSchedule}
                                                    onChange={handleWorkScheduleChange}
                                                    placeholder="Ex: 44"
                                                />
                                            </div>



                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Faixa Salarial (R$)</label>
                                                <div className="flex gap-2 mt-1">
                                                    <div className="relative rounded-md shadow-sm w-full">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <span className="text-gray-500 sm:text-sm">R$</span>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            name="salaryMin"
                                                            id="salaryMin"
                                                            className="focus:ring-brand focus:border-brand block w-full pl-7 py-2 sm:text-sm border border-gray-300 rounded-md shadow-sm"
                                                            placeholder="Mínimo"
                                                            value={salaryMin}
                                                            onChange={e => setSalaryMin(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="relative rounded-md shadow-sm w-full">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <span className="text-gray-500 sm:text-sm">R$</span>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            name="salaryMax"
                                                            id="salaryMax"
                                                            className="focus:ring-brand focus:border-brand block w-full pl-7 py-2 sm:text-sm border border-gray-300 rounded-md shadow-sm"
                                                            placeholder="Máximo"
                                                            value={salaryMax}
                                                            onChange={e => setSalaryMax(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                                            <textarea
                                                id="description"
                                                rows={3}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                                value={description}
                                                onChange={e => setDescription(e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">Requisitos</label>
                                            <textarea
                                                id="requirements"
                                                rows={3}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                                value={requirements}
                                                onChange={e => setRequirements(e.target.value)}
                                                placeholder="Principais competências e requisitos..."
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand text-base font-medium text-white hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                    >
                                        {formLoading ? 'Salvando...' : 'Salvar'}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
