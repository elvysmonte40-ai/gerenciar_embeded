import { supabase } from '../../../lib/supabase';

export interface EmployeeMovement {
    id: string;
    type: string;
    created_at: string;
    justification?: string;
    profile: {
        full_name: string;
    };
    old_department?: { name: string };
    new_department?: { name: string };
    old_sector?: { name: string };
    new_sector?: { name: string };
    old_job_title?: { title: string };
    new_job_title?: { title: string };
    creator?: { full_name: string };
}

export const getEmployeeMovements = async (organizationId: string): Promise<EmployeeMovement[]> => {
    const { data, error } = await supabase
        .from('employee_movements')
        .select(`
            id,
            type,
            created_at,
            justification,
            profile:profile_id (
                full_name
            ),
            old_department:old_department_id (name),
            new_department:new_department_id (name),
            old_sector:old_sector_id (name),
            new_sector:new_sector_id (name),
            old_job_title:old_job_title_id (title),
            new_job_title:new_job_title_id (title),
            creator:created_by (full_name)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching movements:', error);
        throw error;
    }

    return data as any;
};
