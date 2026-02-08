
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const GET: APIRoute = async ({ params, request }) => {
    const { id } = params;

    if (!id) {
        return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
    }

    try {
        const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
        const supabaseServiceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceRoleKey) {
            return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // 1. Verify Authentication
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Unauthorized: No token' }), { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), { status: 401 });
        }

        // 2. Check Permissions (Admin or Self)
        // We check the role of the requester
        const { data: requesterProfile } = await supabaseAdmin
            .from('profiles')
            .select('role, organization_id')
            .eq('id', user.id)
            .single();

        if (!requesterProfile) {
            return new Response(JSON.stringify({ error: 'User profile not found' }), { status: 403 });
        }

        const isSelf = user.id === id;
        const isAdmin = requesterProfile.role === 'admin';

        // Fetch target user's organization to ensure admin belongs to same org (if targeting other user)
        // But since we use IDs, let's just fetch the target user and check org.

        // 3. Fetch specific user details from Auth Admin (to get email)
        const { data: targetUser, error: targetError } = await supabaseAdmin.auth.admin.getUserById(id);

        if (targetError || !targetUser.user) {
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
        }

        // Security check: If not self, must be admin of SAME organization.
        // We get org_id from the target user's metadata or profile.
        const targetOrgId = targetUser.user.user_metadata?.organization_id;

        if (!isSelf) {
            if (!isAdmin) {
                return new Response(JSON.stringify({ error: 'Forbidden: You are not an admin' }), { status: 403 });
            }
            if (targetOrgId !== requesterProfile.organization_id) {
                return new Response(JSON.stringify({ error: 'Forbidden: Different organization' }), { status: 403 });
            }
        }

        // 4. Return Data
        return new Response(JSON.stringify({
            id: targetUser.user.id,
            email: targetUser.user.email,
            user_metadata: targetUser.user.user_metadata,
            app_metadata: targetUser.user.app_metadata
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
    }
};
