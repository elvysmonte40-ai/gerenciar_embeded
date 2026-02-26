import type { Database } from './supabase';

export type Process = Database['public']['Tables']['processes']['Row'];
export type ProcessVersion = Database['public']['Tables']['process_versions']['Row'];
export type ProcessStep = Database['public']['Tables']['process_steps']['Row'];
export type ProcessAttachment = Database['public']['Tables']['process_attachments']['Row'];
export type ProcessApprover = Database['public']['Tables']['process_version_approvers']['Row'];

export type ProcessStatus = ProcessVersion['status']; // 'draft' | 'awaiting_approval' | 'published' | 'archived'

// Extended types for UI with joined data
export interface ProcessWithDetails extends Process {
    department?: { name: string } | null;
    viewer_roles?: { organization_role_id: string }[] | null;
    editor_roles?: { organization_role_id: string }[] | null;
    current_version?: ProcessVersion | null;
    versions?: (Pick<ProcessVersion, 'status' | 'version_number' | 'created_at' | 'id'> & {
        approvers?: {
            id: string;
            status: 'pending' | 'approved' | 'rejected';
            user_id: string;
            user?: { full_name: string; email: string; job_title?: string; id: string } | null;
        }[]
    })[];
}

export interface ProcessVersionWithRelations extends ProcessVersion {
    steps: ProcessStep[];
    attachments: ProcessAttachment[];
    approvers: ProcessApprover[];
    process: Process; // Parent process
}
