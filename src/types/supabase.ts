export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "14.1"
    }
    public: {
        Tables: {
            departments: {
                Row: {
                    created_at: string
                    created_by: string | null
                    description: string | null
                    id: string
                    is_active: boolean | null
                    name: string
                    organization_id: string
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    created_by?: string | null
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                    name: string
                    organization_id: string
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    created_by?: string | null
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                    name?: string
                    organization_id?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "departments_created_by_fkey"
                        columns: ["created_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "departments_organization_id_fkey"
                        columns: ["organization_id"]
                        isOneToOne: false
                        referencedRelation: "organizations"
                        referencedColumns: ["id"]
                    },
                ]
            }
            employee_movements: {
                Row: {
                    created_at: string
                    created_by: string | null
                    id: string
                    justification: string | null
                    new_department_id: string | null
                    new_job_title_id: string | null
                    new_sector_id: string | null
                    old_department_id: string | null
                    old_job_title_id: string | null
                    old_sector_id: string | null
                    organization_id: string
                    profile_id: string
                    type: string
                }
                Insert: {
                    created_at?: string
                    created_by?: string | null
                    id?: string
                    justification?: string | null
                    new_department_id?: string | null
                    new_job_title_id?: string | null
                    new_sector_id?: string | null
                    old_department_id?: string | null
                    old_job_title_id?: string | null
                    old_sector_id?: string | null
                    organization_id: string
                    profile_id: string
                    type: string
                }
                Update: {
                    created_at?: string
                    created_by?: string | null
                    id?: string
                    justification?: string | null
                    new_department_id?: string | null
                    new_job_title_id?: string | null
                    new_sector_id?: string | null
                    old_department_id?: string | null
                    old_job_title_id?: string | null
                    old_sector_id?: string | null
                    organization_id?: string
                    profile_id?: string
                    type?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "employee_movements_created_by_fkey"
                        columns: ["created_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "employee_movements_new_department_id_fkey"
                        columns: ["new_department_id"]
                        isOneToOne: false
                        referencedRelation: "departments"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "employee_movements_new_job_title_id_fkey"
                        columns: ["new_job_title_id"]
                        isOneToOne: false
                        referencedRelation: "job_titles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "employee_movements_new_sector_id_fkey"
                        columns: ["new_sector_id"]
                        isOneToOne: false
                        referencedRelation: "sectors"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "employee_movements_old_department_id_fkey"
                        columns: ["old_department_id"]
                        isOneToOne: false
                        referencedRelation: "departments"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "employee_movements_old_job_title_id_fkey"
                        columns: ["old_job_title_id"]
                        isOneToOne: false
                        referencedRelation: "job_titles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "employee_movements_old_sector_id_fkey"
                        columns: ["old_sector_id"]
                        isOneToOne: false
                        referencedRelation: "sectors"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "employee_movements_organization_id_fkey"
                        columns: ["organization_id"]
                        isOneToOne: false
                        referencedRelation: "organizations"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "employee_movements_profile_id_fkey"
                        columns: ["profile_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            indicator_entries: {
                Row: {
                    budget: number | null
                    created_at: string
                    id: string
                    indicator_id: string
                    month: number
                    realized: number | null
                    target: number | null
                    updated_at: string
                    year: number
                }
                Insert: {
                    budget?: number | null
                    created_at?: string
                    id?: string
                    indicator_id: string
                    month: number
                    realized?: number | null
                    target?: number | null
                    updated_at?: string
                    year: number
                }
                Update: {
                    budget?: number | null
                    created_at?: string
                    id?: string
                    indicator_id?: string
                    month?: number
                    realized?: number | null
                    target?: number | null
                    updated_at?: string
                    year?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "indicator_entries_indicator_id_fkey"
                        columns: ["indicator_id"]
                        isOneToOne: false
                        referencedRelation: "indicators"
                        referencedColumns: ["id"]
                    },
                ]
            }
            indicators: {
                Row: {
                    calculation_type: string
                    created_at: string
                    decimal_places: number
                    description: string | null
                    direction: Database["public"]["Enums"]["indicator_direction"]
                    id: string
                    organization_id: string
                    owner_id: string | null
                    periodicity: string
                    sort_order: number
                    title: string
                    unit: Database["public"]["Enums"]["indicator_unit"]
                    updated_at: string
                }
                Insert: {
                    calculation_type?: string
                    created_at?: string
                    decimal_places?: number
                    description?: string | null
                    direction?: Database["public"]["Enums"]["indicator_direction"]
                    id?: string
                    organization_id: string
                    owner_id?: string | null
                    periodicity?: string
                    sort_order?: number
                    title: string
                    unit?: Database["public"]["Enums"]["indicator_unit"]
                    updated_at?: string
                }
                Update: {
                    calculation_type?: string
                    created_at?: string
                    decimal_places?: number
                    description?: string | null
                    direction?: Database["public"]["Enums"]["indicator_direction"]
                    id?: string
                    organization_id?: string
                    owner_id?: string | null
                    periodicity?: string
                    sort_order?: number
                    title?: string
                    unit?: Database["public"]["Enums"]["indicator_unit"]
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "indicators_organization_id_fkey"
                        columns: ["organization_id"]
                        isOneToOne: false
                        referencedRelation: "organizations"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "indicators_owner_id_fkey"
                        columns: ["owner_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            job_titles: {
                Row: {
                    cbo_code: string | null
                    created_at: string
                    created_by: string | null
                    department_id: string | null
                    description: string | null
                    id: string
                    is_active: boolean | null
                    organization_id: string
                    requirements: string | null
                    salary_max: number | null
                    salary_min: number | null
                    schedule_type: string | null
                    sector_id: string | null
                    seniority_level: string | null
                    title: string
                    updated_at: string
                    work_model: string | null
                    work_schedule: string | null
                }
                Insert: {
                    cbo_code?: string | null
                    created_at?: string
                    created_by?: string | null
                    department_id?: string | null
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                    organization_id: string
                    requirements?: string | null
                    salary_max?: number | null
                    salary_min?: number | null
                    schedule_type?: string | null
                    sector_id?: string | null
                    seniority_level?: string | null
                    title: string
                    updated_at?: string
                    work_model?: string | null
                    work_schedule?: string | null
                }
                Update: {
                    cbo_code?: string | null
                    created_at?: string
                    created_by?: string | null
                    department_id?: string | null
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                    organization_id?: string
                    requirements?: string | null
                    salary_max?: number | null
                    salary_min?: number | null
                    schedule_type?: string | null
                    sector_id?: string | null
                    seniority_level?: string | null
                    title?: string
                    updated_at?: string
                    work_model?: string | null
                    work_schedule?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "job_titles_created_by_fkey"
                        columns: ["created_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "job_titles_department_id_fkey"
                        columns: ["department_id"]
                        isOneToOne: false
                        referencedRelation: "departments"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "job_titles_organization_id_fkey"
                        columns: ["organization_id"]
                        isOneToOne: false
                        referencedRelation: "organizations"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "job_titles_sector_id_fkey"
                        columns: ["sector_id"]
                        isOneToOne: false
                        referencedRelation: "sectors"
                        referencedColumns: ["id"]
                    },
                ]
            }
            organization_dashboards: {
                Row: {
                    allowed_groups: string | null
                    created_at: string
                    description: string | null
                    id: string
                    menu_id: string | null
                    name: string
                    organization_id: string
                    report_id: string
                    updated_at: string
                    workspace_id: string
                }
                Insert: {
                    allowed_groups?: string | null
                    created_at?: string
                    description?: string | null
                    id?: string
                    menu_id?: string | null
                    name: string
                    organization_id: string
                    report_id: string
                    updated_at?: string
                    workspace_id: string
                }
                Update: {
                    allowed_groups?: string | null
                    created_at?: string
                    description?: string | null
                    id?: string
                    menu_id?: string | null
                    name?: string
                    organization_id?: string
                    report_id?: string
                    updated_at?: string
                    workspace_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "organization_dashboards_menu_id_fkey"
                        columns: ["menu_id"]
                        isOneToOne: false
                        referencedRelation: "organization_menus"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "organization_dashboards_organization_id_fkey"
                        columns: ["organization_id"]
                        isOneToOne: false
                        referencedRelation: "organizations"
                        referencedColumns: ["id"]
                    },
                ]
            }
            organization_menus: {
                Row: {
                    created_at: string
                    icon_name: string | null
                    icon_url: string | null
                    id: string
                    is_active: boolean | null
                    order_index: number | null
                    organization_id: string
                    title: string
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    icon_name?: string | null
                    icon_url?: string | null
                    id?: string
                    is_active?: boolean | null
                    order_index?: number | null
                    organization_id: string
                    title: string
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    icon_name?: string | null
                    icon_url?: string | null
                    id?: string
                    is_active?: boolean | null
                    order_index?: number | null
                    organization_id?: string
                    title?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "organization_menus_organization_id_fkey"
                        columns: ["organization_id"]
                        isOneToOne: false
                        referencedRelation: "organizations"
                        referencedColumns: ["id"]
                    },
                ]
            }
            organization_role_dashboards: {
                Row: {
                    created_at: string
                    dashboard_id: string
                    organization_role_id: string
                }
                Insert: {
                    created_at?: string
                    dashboard_id: string
                    organization_role_id: string
                }
                Update: {
                    created_at?: string
                    dashboard_id?: string
                    organization_role_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "organization_role_dashboards_dashboard_id_fkey"
                        columns: ["dashboard_id"]
                        isOneToOne: false
                        referencedRelation: "organization_dashboards"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "organization_role_dashboards_organization_role_id_fkey"
                        columns: ["organization_role_id"]
                        isOneToOne: false
                        referencedRelation: "organization_roles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            organization_roles: {
                Row: {
                    can_export_data: boolean | null
                    created_at: string
                    description: string | null
                    id: string
                    is_active: boolean | null
                    name: string
                    organization_id: string
                    pbi_roles: string | null
                    updated_at: string
                }
                Insert: {
                    can_export_data?: boolean | null
                    created_at?: string
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                    name: string
                    organization_id: string
                    pbi_roles?: string | null
                    updated_at?: string
                }
                Update: {
                    can_export_data?: boolean | null
                    created_at?: string
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                    name?: string
                    organization_id?: string
                    pbi_roles?: string | null
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "organization_roles_organization_id_fkey"
                        columns: ["organization_id"]
                        isOneToOne: false
                        referencedRelation: "organizations"
                        referencedColumns: ["id"]
                    },
                ]
            }
            organization_settings: {
                Row: {
                    created_at: string
                    organization_id: string
                    pbi_client_id: string | null
                    pbi_client_secret: string | null
                    pbi_tenant_id: string | null
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    organization_id: string
                    pbi_client_id?: string | null
                    pbi_client_secret?: string | null
                    pbi_tenant_id?: string | null
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    organization_id?: string
                    pbi_client_id?: string | null
                    pbi_client_secret?: string | null
                    pbi_tenant_id?: string | null
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "organization_settings_organization_id_fkey"
                        columns: ["organization_id"]
                        isOneToOne: true
                        referencedRelation: "organizations"
                        referencedColumns: ["id"]
                    },
                ]
            }
            organizations: {
                Row: {
                    cnpj: string | null
                    created_at: string
                    id: string
                    name: string
                    segment: string | null
                }
                Insert: {
                    cnpj?: string | null
                    created_at?: string
                    id?: string
                    name: string
                    segment?: string | null
                }
                Update: {
                    cnpj?: string | null
                    created_at?: string
                    id?: string
                    name?: string
                    segment?: string | null
                }
                Relationships: []
            }
            process_attachments: {
                Row: {
                    created_at: string
                    created_by: string | null
                    file_name: string
                    file_path: string
                    file_size: number | null
                    file_type: string | null
                    id: string
                    process_version_id: string
                    step_id: string | null
                }
                Insert: {
                    created_at?: string
                    created_by?: string | null
                    file_name: string
                    file_path: string
                    file_size?: number | null
                    file_type?: string | null
                    id?: string
                    process_version_id: string
                    step_id?: string | null
                }
                Update: {
                    created_at?: string
                    created_by?: string | null
                    file_name?: string
                    file_path?: string
                    file_size?: number | null
                    file_type?: string | null
                    id?: string
                    process_version_id?: string
                    step_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "process_attachments_process_version_id_fkey"
                        columns: ["process_version_id"]
                        isOneToOne: false
                        referencedRelation: "process_versions"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "process_attachments_step_id_fkey"
                        columns: ["step_id"]
                        isOneToOne: false
                        referencedRelation: "process_steps"
                        referencedColumns: ["id"]
                    },
                ]
            }
            process_steps: {
                Row: {
                    created_at: string
                    description_html: string | null
                    id: string
                    metadata: Json | null
                    order_index: number
                    process_version_id: string
                    role_responsible: string | null
                    title: string
                }
                Insert: {
                    created_at?: string
                    description_html?: string | null
                    id?: string
                    metadata?: Json | null
                    order_index?: number
                    process_version_id: string
                    role_responsible?: string | null
                    title: string
                }
                Update: {
                    created_at?: string
                    description_html?: string | null
                    id?: string
                    metadata?: Json | null
                    order_index?: number
                    process_version_id?: string
                    role_responsible?: string | null
                    title?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "process_steps_process_version_id_fkey"
                        columns: ["process_version_id"]
                        isOneToOne: false
                        referencedRelation: "process_versions"
                        referencedColumns: ["id"]
                    },
                ]
            }
            process_version_approvers: {
                Row: {
                    comments: string | null
                    created_at: string
                    id: string
                    process_version_id: string
                    status: string
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    comments?: string | null
                    created_at?: string
                    id?: string
                    process_version_id: string
                    status?: string
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    comments?: string | null
                    created_at?: string
                    id?: string
                    process_version_id?: string
                    status?: string
                    updated_at?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "process_version_approvers_process_version_id_fkey"
                        columns: ["process_version_id"]
                        isOneToOne: false
                        referencedRelation: "process_versions"
                        referencedColumns: ["id"]
                    },
                ]
            }
            process_versions: {
                Row: {
                    change_log: string | null
                    created_at: string
                    created_by: string | null
                    flow_data: Json | null
                    id: string
                    process_id: string
                    published_at: string | null
                    published_by: string | null
                    status: string
                    version_number: number
                }
                Insert: {
                    change_log?: string | null
                    created_at?: string
                    created_by?: string | null
                    flow_data?: Json | null
                    id?: string
                    process_id: string
                    published_at?: string | null
                    published_by?: string | null
                    status?: string
                    version_number: number
                }
                Update: {
                    change_log?: string | null
                    created_at?: string
                    created_by?: string | null
                    flow_data?: Json | null
                    id?: string
                    process_id?: string
                    published_at?: string | null
                    published_by?: string | null
                    status?: string
                    version_number?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "process_versions_process_id_fkey"
                        columns: ["process_id"]
                        isOneToOne: false
                        referencedRelation: "processes"
                        referencedColumns: ["id"]
                    },
                ]
            }
            processes: {
                Row: {
                    code: string | null
                    created_at: string
                    created_by: string | null
                    current_version_id: string | null
                    department_id: string | null
                    description: string | null
                    id: string
                    is_active: boolean | null
                    organization_id: string
                    title: string
                    updated_at: string
                }
                Insert: {
                    code?: string | null
                    created_at?: string
                    created_by?: string | null
                    current_version_id?: string | null
                    department_id?: string | null
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                    organization_id: string
                    title: string
                    updated_at?: string
                }
                Update: {
                    code?: string | null
                    created_at?: string
                    created_by?: string | null
                    current_version_id?: string | null
                    department_id?: string | null
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                    organization_id?: string
                    title?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "fk_processes_current_version"
                        columns: ["current_version_id"]
                        isOneToOne: false
                        referencedRelation: "process_versions"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "processes_department_id_fkey"
                        columns: ["department_id"]
                        isOneToOne: false
                        referencedRelation: "departments"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "processes_organization_id_fkey"
                        columns: ["organization_id"]
                        isOneToOne: false
                        referencedRelation: "organizations"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    birth_date: string | null
                    can_export_data: boolean | null
                    cpf: string | null
                    created_at: string | null
                    department: string | null
                    department_id: string | null
                    email: string | null
                    employee_id: number
                    full_name: string | null
                    gender: string | null
                    id: string
                    is_super_admin: boolean | null
                    job_title: string | null
                    job_title_id: string | null
                    manager_id: string | null
                    organization_id: string | null
                    organization_role_id: string | null
                    role: string | null
                    sector_id: string | null
                    status: string | null
                }
                Insert: {
                    birth_date?: string | null
                    can_export_data?: boolean | null
                    cpf?: string | null
                    created_at?: string | null
                    department?: string | null
                    department_id?: string | null
                    email?: string | null
                    employee_id: number
                    full_name?: string | null
                    gender?: string | null
                    id: string
                    is_super_admin?: boolean | null
                    job_title?: string | null
                    job_title_id?: string | null
                    manager_id?: string | null
                    organization_id?: string | null
                    organization_role_id?: string | null
                    role?: string | null
                    sector_id?: string | null
                    status?: string | null
                }
                Update: {
                    birth_date?: string | null
                    can_export_data?: boolean | null
                    cpf?: string | null
                    created_at?: string | null
                    department?: string | null
                    department_id?: string | null
                    email?: string | null
                    employee_id?: number
                    full_name?: string | null
                    gender?: string | null
                    id?: string
                    is_super_admin?: boolean | null
                    job_title?: string | null
                    job_title_id?: string | null
                    manager_id?: string | null
                    organization_id?: string | null
                    organization_role_id?: string | null
                    role?: string | null
                    sector_id?: string | null
                    status?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_department_id_fkey"
                        columns: ["department_id"]
                        isOneToOne: false
                        referencedRelation: "departments"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "profiles_job_title_id_fkey"
                        columns: ["job_title_id"]
                        isOneToOne: false
                        referencedRelation: "job_titles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "profiles_manager_id_fkey"
                        columns: ["manager_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "profiles_organization_id_fkey"
                        columns: ["organization_id"]
                        isOneToOne: false
                        referencedRelation: "organizations"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "profiles_organization_role_id_fkey"
                        columns: ["organization_role_id"]
                        isOneToOne: false
                        referencedRelation: "organization_roles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "profiles_sector_id_fkey"
                        columns: ["sector_id"]
                        isOneToOne: false
                        referencedRelation: "sectors"
                        referencedColumns: ["id"]
                    },
                ]
            }
            sectors: {
                Row: {
                    created_at: string
                    created_by: string | null
                    department_id: string | null
                    description: string | null
                    id: string
                    is_active: boolean | null
                    name: string
                    organization_id: string
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    created_by?: string | null
                    department_id?: string | null
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                    name: string
                    organization_id: string
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    created_by?: string | null
                    department_id?: string | null
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                    name?: string
                    organization_id?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "sectors_created_by_fkey"
                        columns: ["created_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "sectors_department_id_fkey"
                        columns: ["department_id"]
                        isOneToOne: false
                        referencedRelation: "departments"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "sectors_organization_id_fkey"
                        columns: ["organization_id"]
                        isOneToOne: false
                        referencedRelation: "organizations"
                        referencedColumns: ["id"]
                    },
                ]
            }
            system_message_reads: {
                Row: {
                    id: string
                    message_id: string | null
                    read_at: string | null
                    user_id: string | null
                }
                Insert: {
                    id?: string
                    message_id?: string | null
                    read_at?: string | null
                    user_id?: string | null
                }
                Update: {
                    id?: string
                    message_id?: string | null
                    read_at?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "system_message_reads_message_id_fkey"
                        columns: ["message_id"]
                        isOneToOne: false
                        referencedRelation: "system_messages"
                        referencedColumns: ["id"]
                    },
                ]
            }
            system_messages: {
                Row: {
                    content: string
                    created_at: string | null
                    created_by: string | null
                    end_date: string | null
                    id: string
                    organization_id: string | null
                    start_date: string | null
                    status: string
                    target_audience: string
                    target_ids: Json | null
                    title: string
                    type: string
                }
                Insert: {
                    content: string
                    created_at?: string | null
                    created_by?: string | null
                    end_date?: string | null
                    id?: string
                    organization_id?: string | null
                    start_date?: string | null
                    status?: string
                    target_audience?: string
                    target_ids?: Json | null
                    title: string
                    type?: string
                }
                Update: {
                    content?: string
                    created_at?: string | null
                    created_by?: string | null
                    end_date?: string | null
                    id?: string
                    organization_id?: string | null
                    start_date?: string | null
                    status?: string
                    target_audience?: string
                    target_ids?: Json | null
                    title?: string
                    type?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "system_messages_organization_id_fkey"
                        columns: ["organization_id"]
                        isOneToOne: false
                        referencedRelation: "organizations"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            create_organization_and_return_id: {
                Args: { p_cnpj: string; p_name: string; p_segment: string }
                Returns: string
            }
            get_auth_user_organization_id: { Args: never; Returns: string }
            has_process_permission: {
                Args: { permission_type: string; target_department_id: string }
                Returns: boolean
            }
        }
        Enums: {
            indicator_direction: "HIGHER_BETTER" | "LOWER_BETTER"
            indicator_unit: "currency" | "percent" | "number"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
    DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
    public: {
        Enums: {
            indicator_direction: ["HIGHER_BETTER", "LOWER_BETTER"],
            indicator_unit: ["currency", "percent", "number"],
        },
    },
} as const
