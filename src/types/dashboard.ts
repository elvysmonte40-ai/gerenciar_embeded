export interface PermissionRules {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
}

export interface AppPermissions {
    users: PermissionRules;
    processes: PermissionRules;
    indicators: PermissionRules;
    profiles: PermissionRules;
    contracts: PermissionRules;
    organization: {
        manage_settings: boolean;
    };
}

export const DEFAULT_PERMISSIONS: AppPermissions = {
    users: { view: false, create: false, edit: false, delete: false },
    processes: { view: false, create: false, edit: false, delete: false },
    indicators: { view: false, create: false, edit: false, delete: false },
    profiles: { view: false, create: false, edit: false, delete: false },
    contracts: { view: false, create: false, edit: false, delete: false },
    organization: { manage_settings: false },
};

export interface OrganizationRole {
    id: string;
    organization_id: string;
    name: string;
    description?: string;
    pbi_roles?: string;
    can_export_data: boolean;
    permissions: AppPermissions; // New field
    is_active: boolean;
    created_at: string;
    updated_at: string;
    dashboards?: string[];
}

export interface OrganizationMenu {
    id: string;
    organization_id: string;
    title: string;
    icon_name?: string;
    icon_url?: string;
    order_index: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface OrganizationDashboard {
    id: string;
    organization_id: string;
    name: string;
    description?: string;
    workspace_id: string;
    report_id: string;
    allowed_groups?: string;
    menu_id?: string;
    created_at: string;
    updated_at: string;
}
