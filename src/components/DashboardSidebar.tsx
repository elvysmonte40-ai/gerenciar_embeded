import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import MenuIcon from './MenuIcon';

interface Dashboard {
    id: string;
    name: string;
    menu_id: string | null;
}

interface Menu {
    id: string;
    title: string;
    icon_name?: string;
    icon_url?: string;
    order_index: number;
    dashboards: Dashboard[];
}

export default function DashboardSidebar() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Simple extraction of ID from query param or path
        const searchParams = new URLSearchParams(window.location.search);
        setCurrentId(searchParams.get('id'));

        async function fetchData() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('organization_id')
                    .eq('id', session.user.id)
                    .single();

                if (!profile?.organization_id) return;

                // Fetch Menus
                const { data: menusData, error: menusError } = await supabase
                    .from('organization_menus')
                    .select('*')
                    .eq('organization_id', profile.organization_id)
                    .eq('is_active', true)
                    .order('order_index', { ascending: true });

                if (menusError) throw menusError;

                // Fetch Dashboards
                const { data: dashboardsData, error: dashboardsError } = await supabase
                    .from('organization_dashboards')
                    .select('id, name, menu_id')
                    .eq('organization_id', profile.organization_id);

                if (dashboardsError) throw dashboardsError;

                // Group dashboards by menu
                const structuredMenus: Menu[] = menusData.map((menu: any) => ({
                    ...menu,
                    dashboards: dashboardsData.filter((d: any) => d.menu_id === menu.id)
                }));

                setMenus(structuredMenus);

                // Check Admin
                const { data: profileRole } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (profileRole?.role === 'admin') {
                    setIsAdmin(true);
                }
            } catch (error) {
                console.error("Error fetching sidebar data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if (loading) {
        return <div className="p-4 text-xs text-gray-400 animate-pulse">Carregando menu...</div>;
    }

    return (
        <div className="flex flex-col space-y-6">
            {/* Default / Home Link */}
            <div>
                <a
                    href="/dashboard"
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${!currentId
                        ? 'bg-white text-brand border border-gray-200 shadow-sm'
                        : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                        }`}
                >
                    <svg className={`mr-3 h-5 w-5 shrink-0 ${!currentId ? 'text-brand' : 'text-gray-400 group-hover:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    Visão Geral
                </a>
            </div>

            {/* Dynamic Menus */}
            {menus.map(menu => (
                <div key={menu.id} className="space-y-1">
                    <div className="px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2 mb-2">
                        <MenuIcon iconName={menu.icon_name} iconUrl={menu.icon_url} className="h-4 w-4" />
                        {menu.title}
                    </div>

                    <div className="space-y-1 ml-2 border-l border-gray-200 pl-2">
                        {menu.dashboards.length > 0 ? (
                            menu.dashboards.map(dashboard => (
                                <a
                                    key={dashboard.id}
                                    href={`/dashboard?id=${dashboard.id}`}
                                    className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentId === dashboard.id
                                        ? 'bg-white text-brand border border-gray-200 shadow-sm'
                                        : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                                        }`}
                                >
                                    {dashboard.name}
                                </a>
                            ))
                        ) : (
                            <span className="block px-3 py-2 text-xs text-gray-400 italic">
                                Sem dashboards
                            </span>
                        )}
                    </div>
                </div>
            ))}

            {/* Admin Link */}
            {isAdmin && (
                <div className="pt-4 border-t border-gray-200 mt-auto">
                    <a
                        href="/admin/settings"
                        className="flex items-center px-3 py-2 text-sm font-medium text-text-secondary hover:text-brand hover:bg-gray-50 rounded-md transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Administrador
                    </a>
                </div>
            )}
        </div>
    );
}
