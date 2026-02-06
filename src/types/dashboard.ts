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

export interface OrganizationRole {
    id: string;
    organization_id: string;
    name: string;
    description?: string;
    pbi_roles?: string;
    can_export_data: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    dashboards?: string[]; // IDs of assigned dashboards
}
