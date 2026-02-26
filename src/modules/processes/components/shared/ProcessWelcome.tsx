import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { Plus, FileText } from 'lucide-react';
import type { AppPermissions } from '../../../../types/dashboard';

export const ProcessWelcome: React.FC = () => {
    // Permission State
    const [permissions, setPermissions] = useState<AppPermissions | null>(null);
    const [isOrgAdmin, setIsOrgAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadPermissions() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const { fetchUserPermissions } = await import('../../../../utils/permissions');
                const perms = await fetchUserPermissions(session.user.id);

                setPermissions(perms.permissions);
                setIsOrgAdmin(perms.isOrgAdmin);
            } catch (error) {
                console.error("Error loading permissions for welcome screen:", error);
            } finally {
                setLoading(false);
            }
        }
        loadPermissions();
    }, []);

    if (loading) return null;

    const canCreate = isOrgAdmin || permissions?.processes?.create;

    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-4">
            <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 max-w-lg w-full">
                <div className="mx-auto flex flex-col items-center justify-center h-16 w-16 rounded-full bg-brand/10 mb-6">
                    <FileText className="h-8 w-8 text-brand" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Processos</h2>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
                    Selecione um processo no menu lateral para visualizar ou editar seus detalhes.
                </p>

                {canCreate ? (
                    <a
                        href="/processes/novo"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors w-full sm:w-auto"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Criar Novo Processo
                    </a>
                ) : (
                    <div className="inline-flex items-center text-sm text-gray-400 bg-gray-50 px-4 py-2 rounded-md border border-gray-100">
                        Você não tem permissão para criar processos.
                    </div>
                )}
            </div>
        </div>
    );
};
