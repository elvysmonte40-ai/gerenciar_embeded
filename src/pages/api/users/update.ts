
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const POST: APIRoute = async ({ request, redirect }) => {
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

        // Verify authentication
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        // Check if user is admin or managing themselves (though this endpoint is for updates)
        // We get the payload
        const payload = await request.json();
        const { id, email, password, ...profileUpdates } = payload;

        if (!id) {
            return new Response(JSON.stringify({ error: 'User ID required' }), { status: 400 });
        }

        // Check permissions: only admin or the user themselves can update
        // But usually admins update other users.
        // For simplicity, we assume the caller has checked permissions or we check 'role' in profiles.
        const { data: requesterProfile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!requesterProfile || (requesterProfile.role !== 'admin' && user.id !== id)) {
            return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
        }


        // Update Auth Email if changed
        if (email) {
            const { data: userToUpdate, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(id);

            if (userToUpdate && userToUpdate.user && userToUpdate.user.email !== email) {
                const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(id, { email: email });

                if (updateAuthError) {
                    return new Response(JSON.stringify({ error: 'Error updating email: ' + updateAuthError.message }), { status: 500 });
                }
            }
        }

        // Update Password if provided
        if (password) {
            const { error: updatePassError } = await supabaseAdmin.auth.admin.updateUserById(id, { password: password });

            if (updatePassError) {
                return new Response(JSON.stringify({ error: 'Error updating password: ' + updatePassError.message }), { status: 500 });
            }
        }

        // Update Profile Data
        // We can do this via direct client update in frontend, but doing it here ensures consistency if needed.
        // However, the frontend already does it.
        // But since we are here, let's allow profile updates too if passed.
        if (Object.keys(profileUpdates).length > 0) {
            const { error: updateProfileError } = await supabaseAdmin
                .from('profiles')
                .update(profileUpdates)
                .eq('id', id);

            if (updateProfileError) {
                return new Response(JSON.stringify({ error: 'Error updating profile: ' + updateProfileError.message }), { status: 500 });
            }
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};
