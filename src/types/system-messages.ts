export interface SystemMessage {
    id: string;
    title: string;
    content: string;
    type: 'popup' | 'banner';
    status: 'draft' | 'active' | 'archived';
    start_date: string | null;
    end_date: string | null;
    target_audience: 'all' | 'profile' | 'user';
    target_ids: string[]; // JSONB array of UUIDs
    created_at: string;
    created_by: string;
    organization_id: string;
}

export interface SystemMessageRead {
    id: string;
    message_id: string;
    user_id: string;
    read_at: string;
}
