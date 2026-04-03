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

const MenuSection = ({ menu, isCollapsed, currentId }: { menu: Menu, isCollapsed: boolean, currentId: string | null }) => {
    // Check if any dashboard in this menu is active
    const hasActiveDashboard = menu.dashboards.some(d => d.id === currentId);

    // Auto-open if active, otherwise closed by default
    const [isOpen, setIsOpen] = useState(hasActiveDashboard);

    // Update state when currentId changes (if navigating from outside)
    useEffect(() => {
        if (hasActiveDashboard) {
            setIsOpen(true);
        }
    }, [currentId, hasActiveDashboard]);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`w-full space-y-1 ${isCollapsed ? 'flex flex-col items-center border-t border-gray-100 pt-3 relative' : ''}`}>
            <button
                onClick={toggleOpen}
                className={`w-full flex items-center justify-between cursor-pointer ${isCollapsed ? 'justify-center hover:bg-gray-50 rounded-md p-1' : 'hover:bg-gray-50 rounded-md py-1'}`}
                title={menu.title}
            >
                {isCollapsed ? (
                    <div className="mb-1 relative">
                        <MenuIcon 
                            iconName={menu.icon_name} 
                            iconUrl={menu.icon_url} 
                            className={`h-5 w-5 transition-colors ${hasActiveDashboard ? 'text-brand' : 'text-gray-400'}`} 
                        />
                        {hasActiveDashboard && (
                            <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-3 bg-brand rounded-full"></span>
                        )}
                        <span className={`absolute -bottom-2 -right-2 transform scale-75 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${hasActiveDashboard ? 'text-brand' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </span>
                    </div>
                ) : (
                    <div className={`px-3 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 ${hasActiveDashboard ? 'text-brand' : 'text-text-secondary'}`}>
                        <div className="flex items-center gap-2">
                            <MenuIcon iconName={menu.icon_name} iconUrl={menu.icon_url} className="h-4 w-4" />
                            {menu.title}
                        </div>
                    </div>
                )}
                {!isCollapsed && (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-3 w-3 text-text-tertiary mr-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </button>

            {/* List of Dashboards - Conditional Rendering */}
            <div className={`
                space-y-1 
                ${!isCollapsed
                    ? `ml-2 border-l border-gray-200 pl-2 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`
                    : `w-full flex flex-col items-center space-y-2 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`
                }
            `}>
                {menu.dashboards.length > 0 ? (
                    menu.dashboards.map(dashboard => (
                        <a
                            key={dashboard.id}
                            href={`/dashboard?id=${dashboard.id}`}
                            title={isCollapsed ? dashboard.name : ""}
                            className={`block transition-all duration-200 ${isCollapsed
                                ? `p-2 flex justify-center rounded-md ${currentId === dashboard.id
                                    ? 'bg-brand/10 text-brand ring-1 ring-brand/30'
                                    : 'hover:bg-gray-100'
                                }`
                                : `px-3 py-2 text-sm font-medium rounded-r-md ${currentId === dashboard.id
                                    ? 'bg-brand/5 text-brand font-semibold border-l-4 border-brand -ml-2 pl-2.5'
                                    : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                                }`
                                }`}
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
                        <span className="block px-3 py-2 text-xs text-text-tertiary italic">
                            Sem dashboards
                        </span>
                    )
                )}
            </div>
        </div>
    );
};

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

    // Auto-minimize after 10 seconds of opening the module or choosing a new dashboard
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsCollapsed(true);
        }, 10000);

        return () => clearTimeout(timer);
    }, [currentId]);

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
                    .select('organization_id, role, organization_role_id')
                    .eq('id', session.user.id)
                    .single();

                if (!profile?.organization_id) return;

                if (profile.role === 'admin') {
                    setIsAdmin(true);
                }

                // Fetch Menus
                const { data: menusData, error: menusError } = await supabase
                    .from('organization_menus')
                    .select('*')
                    .eq('organization_id', profile.organization_id)
                    .eq('is_active', true)
                    .order('order_index', { ascending: true });

                if (menusError) throw menusError;

                let dashboardsQuery = supabase
                    .from('organization_dashboards')
                    .select('id, name, menu_id')
                    .eq('organization_id', profile.organization_id);

                let allowedDashboardsData: any[] = [];
                let shouldFetchDashboards = true;

                if (profile.role !== 'admin') {
                    if (profile.organization_role_id) {
                        const { data: roleDashboards } = await supabase
                            .from('organization_role_dashboards')
                            .select('dashboard_id')
                            .eq('organization_role_id', profile.organization_role_id);

                        if (roleDashboards && roleDashboards.length > 0) {
                            const allowedIds = roleDashboards.map(d => d.dashboard_id);
                            dashboardsQuery = dashboardsQuery.in('id', allowedIds);
                        } else {
                            shouldFetchDashboards = false; // Tem perfil, mas sem dashboards assinalados
                        }
                    } else {
                        shouldFetchDashboards = false; // Não tem perfil
                    }
                }

                // Fetch Dashboards se for admin ou se tiver acesso a algum
                if (shouldFetchDashboards) {
                    const { data: dashboardsData, error: dashboardsError } = await dashboardsQuery;
                    if (dashboardsError) throw dashboardsError;
                    allowedDashboardsData = dashboardsData;
                }

                // Group dashboards by menu
                const structuredMenus: Menu[] = menusData.map((menu: any) => ({
                    ...menu,
                    dashboards: allowedDashboardsData.filter((d: any) => d.menu_id === menu.id)
                })).filter((menu: any) => menu.dashboards.length > 0);

                setMenus(structuredMenus);

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



                {/* Dynamic Menus */}
                {menus.map(menu => (
                    <MenuSection
                        key={menu.id}
                        menu={menu}
                        isCollapsed={isCollapsed}
                        currentId={currentId}
                    />
                ))}


            </div>
        </aside>
    );
}
