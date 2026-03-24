import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import UserForm from './UserForm';
import { fetchUserPermissions, hasPermission } from '../../../utils/permissions';
import type { AppPermissions } from '../../../types/dashboard';

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
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [emailSending, setEmailSending] = useState<string | null>(null);
    const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
            const orgId = session.user.user_metadata.organization_id;
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
            const orgId = session.user.user_metadata.organization_id;

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

        if (!confirm(`${actionName} este usuário?`)) return;

        // Optimistic update
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ status: newStatus })
                .eq('id', userId);

            if (error) throw error;

            // Refresh local state
            setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));

        } catch (err: any) {
            alert("Erro ao atualizar status: " + err.message);
        }
    };

    const handleSendEmail = async (userId: string, type: 'welcome' | 'password_reset', userName: string) => {
        const typeLabel = type === 'welcome' ? 'boas-vindas' : 'redefinição de senha';
        if (!confirm(`Enviar email de ${typeLabel} para ${userName}?`)) return;

        setEmailSending(userId);
        setOpenMenuId(null);
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
                <div className={`px-4 py-3 rounded-lg text-sm flex items-center gap-2 ${emailMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {emailMessage.type === 'success' ? '✅' : '❌'} {emailMessage.text}
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usuário
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Função
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Matrícula
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cargo/Setor
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cadastro
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Ações</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-brand-light text-brand flex items-center justify-center font-bold text-sm">
                                                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-text-primary">{user.full_name || 'Sem nome'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {user.role === 'admin' ? 'Admin' : 'Colaborador'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.status === 'active' ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Ativo
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                Inativo
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.employee_id || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.job_titles?.title || '-'}</div>
                                        <div className="text-xs text-gray-500">{user.departments?.name || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="relative flex justify-end">
                                            {emailSending === user.id && (
                                                <div className="absolute right-8 top-1/2 -translate-y-1/2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                </div>
                                            )}
                                            {hasPermission(permissions, 'users', 'edit', isOrgAdmin) && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenuId(openMenuId === user.id ? null : user.id);
                                                    }}
                                                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                                    title="Ações"
                                                >
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                    </svg>
                                                </button>
                                            )}

                                            {/* Dropdown Menu */}
                                            {openMenuId === user.id && (
                                                <>
                                                    <div className="fixed inset-0 z-30" onClick={() => setOpenMenuId(null)} />
                                                    <div className="absolute right-0 top-8 z-40 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-1 animate-fadeIn">
                                                        <button
                                                            onClick={() => {
                                                                setEditingUser(user);
                                                                setIsFormOpen(true);
                                                                setOpenMenuId(null);
                                                            }}
                                                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                                                        >
                                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                            Editar
                                                        </button>

                                                        <div className="border-t border-gray-100 my-1" />

                                                        <button
                                                            onClick={() => handleSendEmail(user.id, 'welcome', user.full_name)}
                                                            disabled={emailSending === user.id}
                                                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition-colors disabled:opacity-50"
                                                        >
                                                            <span className="text-base">🎉</span>
                                                            Enviar Boas-vindas
                                                        </button>

                                                        <button
                                                            onClick={() => handleSendEmail(user.id, 'password_reset', user.full_name)}
                                                            disabled={emailSending === user.id}
                                                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-2.5 transition-colors disabled:opacity-50"
                                                        >
                                                            <span className="text-base">🔐</span>
                                                            Enviar Reset de Senha
                                                        </button>

                                                        <div className="border-t border-gray-100 my-1" />

                                                        <button
                                                            onClick={() => {
                                                                setOpenMenuId(null);
                                                                handleToggleStatus(user.id, user.status);
                                                            }}
                                                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${
                                                                user.status === 'active'
                                                                    ? 'text-red-600 hover:bg-red-50'
                                                                    : 'text-green-600 hover:bg-green-50'
                                                            }`}
                                                        >
                                                            {user.status === 'active' ? (
                                                                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> Inativar</>
                                                            ) : (
                                                                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Ativar</>
                                                            )}
                                                        </button>
                                                    </div>
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
                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Página <span className="font-medium">{page}</span> de <span className="font-medium">{totalPages}</span>
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        <span className="sr-only">Anterior</span>
                                        {/* Chevron Left */}
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        <span className="sr-only">Próxima</span>
                                        {/* Chevron Right */}
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
