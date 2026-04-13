import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import UserForm from './UserForm';
import { fetchUserPermissions, hasPermission } from '../../../utils/permissions';
import type { AppPermissions } from '../../../types/dashboard';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { createPortal } from 'react-dom';


interface UserProfile {
    id: string;
    full_name: string;
    role: string;
    status: string; // 'active', 'inactive', 'pending', etc.
    created_at: string;
    organization_id: string;
    cpf?: string;
    birth_date?: string;
    job_title?: string;
    department?: string;
    manager_id?: string;
    employee_id?: number;
    gender?: string;
    job_title_id?: string;
    department_id?: string;
    sector_id?: string;
    job_titles?: { title: string };
    departments?: { name: string };
    sectors?: { name: string };
    organization_role_id?: string;
    is_activated?: boolean;
    activated_at?: string;
}

export default function UserList() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchName, setSearchName] = useState("");
    const [searchCpf, setSearchCpf] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    // Novo: Filtros que mapeamos da api
    const [filterJobTitle, setFilterJobTitle] = useState("");
    const [filterDepartment, setFilterDepartment] = useState("");
    const [filterManager, setFilterManager] = useState("");

    // Lookups for filters
    const [rolesList, setRolesList] = useState<any[]>([]);
    const [deptsList, setDeptsList] = useState<any[]>([]);
    const [managersList, setManagersList] = useState<any[]>([]);

    const [permissions, setPermissions] = useState<AppPermissions | null>(null);
    const [isOrgAdmin, setIsOrgAdmin] = useState(false);
    const ITEMS_PER_PAGE = 10;

    // Email actions
    const [emailSending, setEmailSending] = useState<string | null>(null);
    const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string; link?: string } | null>(null);

    // Modal state
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type: 'danger' | 'info' | 'success' | 'warning';
        confirmLabel?: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
        type: 'info'
    });


    useEffect(() => {
        loadPermissions();
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [page, searchName, searchCpf, filterRole, filterStatus, filterJobTitle, filterDepartment, filterManager]);

    const loadPermissions = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const { permissions, isOrgAdmin } = await fetchUserPermissions(session.user.id);
            setPermissions(permissions);
            setIsOrgAdmin(isOrgAdmin);

            // Carregar lookups de filtros apenas 1 vez após org ser obtida (para evitar props passando na UI)
            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
            const orgId = profile?.organization_id || session.user.user_metadata?.organization_id;
            if (orgId) {
                const [{ data: rData }, { data: dData }, { data: mData }] = await Promise.all([
                    supabase.from('job_titles').select('id, title').eq('organization_id', orgId),
                    supabase.from('departments').select('id, name').eq('organization_id', orgId),
                    supabase.from('profiles').select('manager_name').eq('organization_id', orgId).not('manager_name', 'is', null)
                ]);
                if (rData) setRolesList(rData);
                if (dData) setDeptsList(dData);

                // Managers (Using distinct on front-end for now as it's just TEXT mapping)
                if (mData) {
                    const uniqueManagers = Array.from(new Set(mData.map(m => m.manager_name))).filter(Boolean);
                    setManagersList(uniqueManagers.map(name => ({ name })));
                }
            }
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Check Session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                window.location.href = '/login';
                return;
            }

            // 2. Get Organization ID. 
            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
            const orgId = profile?.organization_id || session.user.user_metadata?.organization_id;

            if (!orgId) {
                throw new Error("Organização não encontrada para o usuário.");
            }

            // 3. Fetch Users
            const from = (page - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            let query = supabase
                .from('profiles')
                .select(`
                    id, full_name, role, status, created_at, organization_id, cpf, birth_date, can_export_data,
                    manager_id, manager_name, employee_id, gender, admission_date, inactivation_date,
                    job_title_id, department_id, sector_id, organization_role_id,
                    is_activated, activated_at,
                    job_titles:job_title_id(title),
                    departments:department_id(name),
                    sectors:sector_id(name)
                `, { count: 'exact' })
                .eq('organization_id', orgId);

            // Apply Filters
            if (searchName) {
                query = query.ilike('full_name', `%${searchName}%`);
            }
            if (searchCpf) {
                const cleanSchCpf = searchCpf.replace(/\D/g, '');
                query = query.like('cpf', `%${cleanSchCpf}%`);
            }
            if (filterRole) {
                query = query.eq('role', filterRole);
            }
            if (filterStatus) {
                query = query.eq('status', filterStatus);
            }
            // Real relations filtering
            if (filterJobTitle) {
                query = query.eq('job_title_id', filterJobTitle);
            }
            if (filterDepartment) {
                query = query.eq('department_id', filterDepartment);
            }
            if (filterManager) {
                query = query.eq('manager_name', filterManager);
            }

            query = query.order('created_at', { ascending: false }).range(from, to);

            const { data, error, count } = await query;

            if (error) throw error;

            // Map data to handle Supabase join returning arrays
            const formattedData = (data || []).map((user: any) => ({
                ...user,
                job_titles: Array.isArray(user.job_titles) ? user.job_titles[0] : user.job_titles,
                departments: Array.isArray(user.departments) ? user.departments[0] : user.departments,
                sectors: Array.isArray(user.sectors) ? user.sectors[0] : user.sectors,
            }));

            setUsers(formattedData);
            if (count) {
                setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
            }

        } catch (err: any) {
            console.error("Error fetching users:", err);
            setError(err.message || 'Erro ao carregar usuários.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        const actionName = currentStatus === 'active' ? 'Inativar' : 'Ativar';
        const type = currentStatus === 'active' ? 'danger' : 'info';

        setConfirmModal({
            isOpen: true,
            title: `${actionName} Colaborador`,
            message: `Tem certeza que deseja ${currentStatus === 'active' ? 'inativar' : 'ativar'} este colaborador?`,
            confirmLabel: actionName,
            type: type,
            onConfirm: () => executeToggleStatus(userId, newStatus)
        });
    };

    const executeToggleStatus = async (userId: string, newStatus: string) => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ status: newStatus })
                .eq('id', userId);

            if (error) throw error;

            // Refresh local state
            setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));

        } catch (err: any) {
            setConfirmModal({
                isOpen: true,
                title: 'Erro ao Atualizar',
                message: err.message || 'Ocorreu um erro inesperado.',
                confirmLabel: 'Entendi',
                type: 'danger',
                onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
            });
        }
    };

    const handleSendEmail = async (userId: string, type: 'welcome' | 'password_reset', userName: string) => {
        const typeLabel = type === 'welcome' ? 'boas-vindas' : 'redefinição de senha';
        
        setConfirmModal({
            isOpen: true,
            title: `Enviar E-mail`,
            message: `Deseja enviar o e-mail de ${typeLabel} para ${userName}?`,
            confirmLabel: 'Enviar E-mail',
            type: 'info',
            onConfirm: () => executeSendEmail(userId, type)
        });
    };

    const executeSendEmail = async (userId: string, type: 'welcome' | 'password_reset') => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setEmailSending(userId);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Sessão expirada');

            const res = await fetch('/api/emails/send-manual', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ type, userId }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Falha ao enviar');

            setEmailMessage({ type: 'success', text: data.message });
            setTimeout(() => setEmailMessage(null), 4000);
        } catch (err: any) {
            setEmailMessage({ type: 'error', text: err.message });
            setTimeout(() => setEmailMessage(null), 4000);
        } finally {
            setEmailSending(null);
        }
    };

    const handleActivateManual = async (user: UserProfile) => {
        setConfirmModal({
            isOpen: true,
            title: `Ativação Manual`,
            message: `Deseja gerar um link de ativação para ${user.full_name}? O colaborador não será ativado agora; ele precisará usar o link para definir sua senha e concluir o acesso.`,
            confirmLabel: 'Gerar Link',
            type: 'success',
            onConfirm: () => executeActivateManual(user)
        });
    };

    const executeActivateManual = async (user: UserProfile) => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setEmailSending(user.id);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Sessão expirada');

            const res = await fetch('/api/users/activate-manual', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ userId: user.id }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Falha ao ativar');

            // Atualizar estado local (REMOVIDO: a ativação ocorre pelo usuário final)
            // setUsers(users.map(u => u.id === user.id ? { ...u, is_activated: true, activated_at: new Date().toISOString() } : u));

            const setupLink = data.setupLink;
            if (setupLink) {
                try {
                    await navigator.clipboard.writeText(setupLink);
                    setConfirmModal({
                        isOpen: true,
                        title: `✅ Link Copiado!`,
                        message: `O link de ativação para ${user.full_name} foi copiado para a área de transferência. Agora você pode enviá-lo diretamente para o colaborador.`,
                        confirmLabel: 'Entendi',
                        type: 'success',
                        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
                    });
                } catch (clipErr) {
                    console.error("Falha ao copiar:", clipErr);
                    setEmailMessage({ 
                        type: 'info', 
                        text: `Usuário ativado! Clique no link abaixo para copiar manualmente:`,
                        link: setupLink
                    });
                }
            } else {
                throw new Error("Link não gerado pela API.");
            }
        } catch (err: any) {

            setEmailMessage({ type: 'error', text: err.message });
            setTimeout(() => setEmailMessage(null), 4000);
        } finally {
            setEmailSending(null);
        }
    };

    if (loading && users.length === 0) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-text-primary">Colaboradores</h2>
                {hasPermission(permissions, 'users', 'create', isOrgAdmin) && (
                    <button
                        onClick={() => {
                            setEditingUser(null);
                            setIsFormOpen(true);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors"
                    >
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Adicionar Usuário
                    </button>
                )}
            </div>

            <UserForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => {
                    fetchUsers();
                    setIsFormOpen(false);
                }}
                userToEdit={editingUser}
            />

            {/* BARRA DE FILTROS */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                        Filtros Avançados
                    </h3>
                    {(searchName || searchCpf || filterRole || filterStatus || filterJobTitle || filterDepartment || filterManager) && (
                        <button
                            onClick={() => {
                                setSearchName(""); setSearchCpf(""); setFilterRole(""); setFilterStatus("");
                                setFilterJobTitle(""); setFilterDepartment(""); setFilterManager("");
                            }}
                            className="text-xs text-brand hover:text-brand-dark transition-colors"
                        >
                            Limpar Filtros
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Nome Busca */}
                    <div>
                        <input
                            type="text"
                            placeholder="Buscar por Nome"
                            className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                    </div>
                    {/* CPF Busca */}
                    <div>
                        <input
                            type="text"
                            placeholder="Buscar por CPF"
                            className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand"
                            value={searchCpf}
                            onChange={(e) => setSearchCpf(e.target.value)}
                        />
                    </div>
                    {/* Status Busca */}
                    <div>
                        <select
                            className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">Status: Todos</option>
                            <option value="active">Ativo</option>
                            <option value="inactive">Inativo</option>
                        </select>
                    </div>
                    {/* Role Busca */}
                    <div>
                        <select
                            className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand"
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                        >
                            <option value="">Acesso: Todos</option>
                            <option value="user">Colaborador</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                    {/* Job Title Busca */}
                    <div>
                        <select
                            className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand"
                            value={filterJobTitle}
                            onChange={(e) => setFilterJobTitle(e.target.value)}
                        >
                            <option value="">Cargo: Todos</option>
                            {rolesList.map((r, i) => (
                                <option key={i} value={r.id}>{r.title}</option>
                            ))}
                        </select>
                    </div>
                    {/* Dept Busca */}
                    <div>
                        <select
                            className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand"
                            value={filterDepartment}
                            onChange={(e) => setFilterDepartment(e.target.value)}
                        >
                            <option value="">Departamento: Todos</option>
                            {deptsList.map((d, i) => (
                                <option key={i} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                    {/* Manager Busca */}
                    <div>
                        <select
                            className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand"
                            value={filterManager}
                            onChange={(e) => setFilterManager(e.target.value)}
                        >
                            <option value="">Líder/Gestor: Todos</option>
                            {managersList.map((m, i) => (
                                <option key={i} value={m.name}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {emailMessage && (
                <div className={`px-4 py-3 rounded-lg text-sm flex flex-col gap-2 ${
                    emailMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
                    emailMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                    'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                    <div className="flex items-center gap-2">
                        {emailMessage.type === 'success' ? '✅' : emailMessage.type === 'error' ? '❌' : 'ℹ️'} {emailMessage.text}
                        {emailMessage.type !== 'info' && (
                            <button onClick={() => setEmailMessage(null)} className="ml-auto text-current opacity-50 hover:opacity-100">&times;</button>
                        )}
                    </div>
                    {emailMessage.link && (
                        <div className="flex items-center gap-2 mt-1">
                            <input 
                                type="text" 
                                readOnly 
                                value={emailMessage.link}
                                className="flex-1 text-xs p-1.5 border border-blue-200 rounded bg-white"
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                            />
                            <button 
                                onClick={() => {
                                    if (emailMessage.link) {
                                        navigator.clipboard.writeText(emailMessage.link);
                                        setConfirmModal({
                                            isOpen: true,
                                            title: '✅ Link Copiado!',
                                            message: 'O link de ativação foi copiado para a área de transferência. Você já pode enviá-lo ao colaborador.',
                                            confirmLabel: 'Entendi',
                                            type: 'success',
                                            onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
                                        });
                                    }
                                }}
                                className="px-2 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                            >
                                Copiar Link
                            </button>
                            <button onClick={() => setEmailMessage(null)} className="px-2 py-1.5 border border-blue-300 rounded text-xs font-medium hover:bg-blue-100">
                                Fechar
                            </button>
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-[11.5px] font-semibold text-text-secondary uppercase tracking-wider">
                                    Usuário
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-[11.5px] font-semibold text-text-secondary uppercase tracking-wider">
                                    Função
                                </th>
                                <th scope="col" className="px-4 py-3 text-center text-[11.5px] font-semibold text-text-secondary uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-4 py-3 text-center text-[11.5px] font-semibold text-text-secondary uppercase tracking-wider">
                                    Matrícula
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-[11.5px] font-semibold text-text-secondary uppercase tracking-wider">
                                    Cargo/Setor
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-[11.5px] font-semibold text-text-secondary uppercase tracking-wider">
                                    Cadastro
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-[11.5px] font-semibold text-text-secondary uppercase tracking-wider">
                                    1º Login
                                </th>
                                <th scope="col" className="px-4 py-3 text-right text-[11.5px] font-semibold text-text-secondary uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user, index) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="shrink-0 h-8 w-8">
                                                <div className="h-8 w-8 rounded-full bg-brand-light text-brand flex items-center justify-center font-bold text-[12px]">
                                                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-[13px] font-semibold text-text-primary truncate max-w-[250px]" title={user.full_name}>{user.full_name || 'Sem nome'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-[10px] leading-4 font-semibold rounded-full ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {user.role === 'admin' ? 'Admin' : 'Colaborador'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                        {user.status === 'active' ? (
                                            <span className="px-2 inline-flex text-[10px] leading-4 font-semibold rounded-full bg-green-100 text-green-800">
                                                Ativo
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-[10px] leading-4 font-semibold rounded-full bg-red-100 text-red-800">
                                                Inativo
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center text-[12px] text-text-secondary font-medium">
                                        {user.employee_id || '-'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="text-[12px] font-medium text-text-primary truncate max-w-[140px]">{user.job_titles?.title || '-'}</div>
                                        <div className="text-[10px] text-text-secondary truncate max-w-[120px]">{user.departments?.name || '-'}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-[12px] text-text-secondary">
                                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-[12px] text-text-secondary">
                                        {user.activated_at ? new Date(user.activated_at).toLocaleDateString('pt-BR') : '-'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right">
                                        <div className="flex justify-end items-center gap-1">
                                            {emailSending === user.id && (
                                                <div className="mr-1">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand"></div>
                                                </div>
                                            )}
                                            
                                            {hasPermission(permissions, 'users', 'edit', isOrgAdmin) && (
                                                <>
                                                    {/* Editar */}
                                                    <button
                                                        onClick={() => {
                                                            setEditingUser(user);
                                                            setIsFormOpen(true);
                                                        }}
                                                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-brand transition-all active:scale-95"
                                                        title="Editar Usuário"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                        </svg>
                                                    </button>

                                                    {/* Boas-vindas */}
                                                    <button
                                                        onClick={() => handleSendEmail(user.id, 'welcome', user.full_name)}
                                                        disabled={emailSending === user.id}
                                                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 hover:text-blue-600 transition-all active:scale-95 disabled:opacity-50"
                                                        title="Enviar Email de Boas-vindas"
                                                    >
                                                        <span className="text-[14px]">🎉</span>
                                                    </button>

                                                    {/* Ativação Manual */}
                                                    <button
                                                        onClick={() => handleActivateManual(user)}
                                                        disabled={emailSending === user.id}
                                                        className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-500 hover:text-emerald-600 transition-all active:scale-95 disabled:opacity-50"
                                                        title="Ativação Manual (sem e-mail)"
                                                    >
                                                        <span className="text-[14px]">🔑</span>
                                                    </button>

                                                    {/* Reset Senha */}
                                                    <button
                                                        onClick={() => handleSendEmail(user.id, 'password_reset', user.full_name)}
                                                        disabled={emailSending === user.id}
                                                        className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-500 hover:text-amber-600 transition-all active:scale-95 disabled:opacity-50"
                                                        title="Enviar Reset de Senha"
                                                    >
                                                        <span className="text-[14px]">🔐</span>
                                                    </button>

                                                    {/* Status Toggle */}
                                                    <button
                                                        onClick={() => handleToggleStatus(user.id, user.status)}
                                                        className={`p-1.5 rounded-lg transition-all active:scale-95 ${
                                                            user.status === 'active'
                                                                ? 'hover:bg-red-50 text-red-500 hover:text-red-600'
                                                                : 'hover:bg-green-50 text-green-500 hover:text-green-600'
                                                        }`}
                                                        title={user.status === 'active' ? 'Inativar Usuário' : 'Ativar Usuário'}
                                                    >
                                                        {user.status === 'active' ? (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                            </svg>
                                                        )}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        Nenhum usuário encontrado nesta organização.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-gray-50/50 px-4 py-2.5 flex items-center justify-between border-t border-gray-100">
                        <div className="flex-1 flex items-center justify-between">
                            <div>
                                <p className="text-[12px] text-gray-500 font-medium">
                                    Página <span className="text-gray-900">{page}</span> de <span className="text-gray-900">{totalPages}</span>
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className={`inline-flex items-center px-3 py-1 rounded-lg border border-gray-200 bg-white text-[12px] font-bold shadow-sm transition-all ${page === 1 ? 'opacity-40 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50 active:scale-95'}`}
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className={`inline-flex items-center px-3 py-1 rounded-lg border border-gray-200 bg-white text-[12px] font-bold shadow-sm transition-all ${page === totalPages ? 'opacity-40 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50 active:scale-95'}`}
                                >
                                    Próxima
                                </button>
                            </div>
                        </div>
                    </div>
                {/* Confirmation Modal */}
                <ConfirmationModal 
                    {...confirmModal}
                    onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                />
            </div>
        </div>
    );
}
