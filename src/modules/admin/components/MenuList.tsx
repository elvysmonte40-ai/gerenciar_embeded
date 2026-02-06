import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { OrganizationMenu } from '../../../types/dashboard';
import MenuForm from './MenuForm';
import MenuIcon from '../../../components/MenuIcon';

export default function MenuList() {
    const [menus, setMenus] = useState<OrganizationMenu[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState<OrganizationMenu | null>(null);

    const fetchMenus = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', session.user.id)
                .single();

            if (!profile?.organization_id) return;

            const { data, error } = await supabase
                .from('organization_menus')
                .select('*')
                .eq('organization_id', profile.organization_id)
                .order('order_index', { ascending: true });

            if (error) throw error;
            setMenus(data || []);
        } catch (error) {
            console.error("Error fetching menus:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenus();
    }, []);

    const handleAdd = () => {
        setEditingMenu(null);
        setIsFormOpen(true);
    };

    const handleEdit = (menu: OrganizationMenu) => {
        setEditingMenu(menu);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Tem certeza que deseja excluir o menu "${title}"?`)) return;

        try {
            const { error } = await supabase
                .from('organization_menus')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setMenus(menus.filter(m => m.id !== id));
        } catch (error) {
            console.error("Error deleting menu:", error);
            alert("Erro ao excluir menu");
        }
    };

    const handleToggleStatus = async (menu: OrganizationMenu) => {
        try {
            const newStatus = !menu.is_active;
            const { error } = await supabase
                .from('organization_menus')
                .update({ is_active: newStatus })
                .eq('id', menu.id);

            if (error) throw error;

            setMenus(menus.map(m => m.id === menu.id ? { ...m, is_active: newStatus } : m));
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                            Gerenciar Menus
                        </h2>
                        <p className="text-xs text-text-secondary mt-1">
                            Organize a navegação lateral dos seus usuários.
                        </p>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors"
                    >
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Novo Menu
                    </button>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-6 text-center text-gray-500 text-sm">Carregando...</div>
                    ) : menus.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 text-sm">
                            Nenhum menu cadastrado. Clique em "Novo Menu" para começar.
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Ícone</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Ordem</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Status</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {menus.map((menu) => (
                                    <tr key={menu.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <MenuIcon iconName={menu.icon_name} iconUrl={menu.icon_url} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-text-primary">{menu.title}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{menu.order_index}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleStatus(menu)}
                                                className={`relative inline-flex shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand ${menu.is_active ? 'bg-brand' : 'bg-gray-200'}`}
                                            >
                                                <span className="sr-only">Use setting</span>
                                                <span
                                                    aria-hidden="true"
                                                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${menu.is_active ? 'translate-x-5' : 'translate-x-0'}`}
                                                ></span>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleEdit(menu)} className="text-brand hover:text-brand-dark mr-4">Editar</button>
                                            <button onClick={() => handleDelete(menu.id, menu.title)} className="text-red-600 hover:text-red-900">Excluir</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <MenuForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => { fetchMenus(); setIsFormOpen(false); }}
                menu={editingMenu}
            />
        </>
    );
}
