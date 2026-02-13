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

    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('dashboard_sidebar_collapsed') === 'true';
        }
        return false;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('dashboard_sidebar_collapsed', String(isCollapsed));
        }
    }, [isCollapsed]);

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
        return <div className="p-4 text-xs text-text-secondary animate-pulse w-64">Carregando menu...</div>;
    }

    return (
        <aside
            className={`${isCollapsed ? 'w-16' : 'w-64'} h-full bg-gray-50/50 border-r border-gray-200 flex flex-col shrink-0 transition-all duration-300 relative group/sidebar z-20`}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50 text-text-secondary z-10 transition-transform md:opacity-0 md:group-hover/sidebar:opacity-100"
                title={isCollapsed ? "Expandir menu" : "Recolher menu"}
            >
                {isCollapsed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                )}
            </button>

            <div className={`flex flex-col h-full py-4 ${isCollapsed ? 'px-2 items-center' : 'px-4'} space-y-6 overflow-y-auto overflow-x-hidden`}>

                {/* Default / Home Link */}
                <div className="w-full">
                    <a
                        href="/dashboard"
                        title={isCollapsed ? "Visão Geral" : ""}
                        className={`group flex items-center ${isCollapsed ? 'justify-center p-2' : 'px-3 py-2'} text-sm font-medium rounded-md transition-colors ${!currentId
                            ? 'bg-white text-brand border border-gray-200 shadow-sm'
                            : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                            }`}
                    >
                        <svg className={`${isCollapsed ? 'h-6 w-6' : 'mr-3 h-5 w-5'} shrink-0 ${!currentId ? 'text-brand' : 'text-gray-400 group-hover:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                        {!isCollapsed && <span>Visão Geral</span>}
                    </a>
                </div>

                {/* Dynamic Menus */}
                {menus.map(menu => (
                    <div key={menu.id} className={`w-full space-y-1 ${isCollapsed ? 'flex flex-col items-center border-t border-gray-100 pt-3' : ''}`}>
                        {/* Menu Title / Separator */}
                        {isCollapsed ? (
                            <div className="mb-1" title={menu.title}>
                                <MenuIcon iconName={menu.icon_name} iconUrl={menu.icon_url} className="h-5 w-5 text-gray-400" />
                            </div>
                        ) : (
                            <div className="px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2 mb-2">
                                <MenuIcon iconName={menu.icon_name} iconUrl={menu.icon_url} className="h-4 w-4" />
                                {menu.title}
                            </div>
                        )}

                        <div className={`space-y-1 ${!isCollapsed ? 'ml-2 border-l border-gray-200 pl-2' : 'w-full flex flex-col items-center space-y-2'}`}>
                            {menu.dashboards.length > 0 ? (
                                menu.dashboards.map(dashboard => (
                                    <a
                                        key={dashboard.id}
                                        href={`/dashboard?id=${dashboard.id}`}
                                        title={isCollapsed ? dashboard.name : ""}
                                        className={`block rounded-md transition-colors ${isCollapsed
                                            ? 'p-2 flex justify-center hover:bg-gray-100'
                                            : `px-3 py-2 text-sm font-medium ${currentId === dashboard.id
                                                ? 'bg-white text-brand border border-gray-200 shadow-sm'
                                                : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                                            }`
                                            } ${(isCollapsed && currentId === dashboard.id) ? 'bg-white text-brand border border-gray-200 shadow-sm' : ''}`}
                                    >
                                        {isCollapsed ? (
                                            // Generic dashboard icon when collapsed
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                <line x1="3" y1="9" x2="21" y2="9" />
                                                <line x1="9" y1="21" x2="9" y2="9" />
                                            </svg>
                                        ) : (
                                            dashboard.name
                                        )}
                                    </a>
                                ))
                            ) : (
                                !isCollapsed && (
                                    <span className="block px-3 py-2 text-xs text-gray-400 italic">
                                        Sem dashboards
                                    </span>
                                )
                            )}
                        </div>
                    </div>
                ))}

                {/* Admin Link */}
                {isAdmin && (
                    <div className={`mt-auto w-full ${!isCollapsed ? 'pt-4 border-t border-gray-200' : 'pt-2 border-t border-gray-200 flex justify-center'}`}>
                        <a
                            href="/admin/settings"
                            title={isCollapsed ? "Administrador" : ""}
                            className={`flex items-center rounded-md transition-colors ${isCollapsed
                                ? 'justify-center p-2 text-text-secondary hover:text-brand hover:bg-gray-50'
                                : 'px-3 py-2 text-sm font-medium text-text-secondary hover:text-brand hover:bg-gray-50'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className={`${isCollapsed ? 'h-6 w-6' : 'mr-3 h-5 w-5'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {!isCollapsed && "Administrador"}
                        </a>
                    </div>
                )}
            </div>
        </aside>
    );
}
