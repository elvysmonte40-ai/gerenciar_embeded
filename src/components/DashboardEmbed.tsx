import React, { useEffect, useState } from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';
import { supabase } from '../lib/supabase';

interface EmbedConfig {
    accessToken: string;
    embedUrl: string;
    reportId: string;
}

export const DashboardEmbed: React.FC = () => {
    const [config, setConfig] = useState<EmbedConfig | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                // Determine Dashboard Context from URL
                const searchParams = new URLSearchParams(window.location.search);
                const dashboardId = searchParams.get('id');

                let targetWorkspaceId: string | undefined;
                let targetReportId: string | undefined;

                // If specific dashboard requested, fetch its config
                if (dashboardId) {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                        const { data: dashboard, error: dbError } = await supabase
                            .from('organization_dashboards')
                            .select('workspace_id, report_id')
                            .eq('id', dashboardId)
                            .single();

                        if (!dbError && dashboard) {
                            targetWorkspaceId = dashboard.workspace_id;
                            targetReportId = dashboard.report_id;
                        }
                    }
                }

                // If no specific dashboard (or fetch failed), utilize defaults or error handled by API if env vars exist
                // Ideally we should pass what we have.
                // The API defined in Supabase Functions expects body.

                const { data: { session } } = await supabase.auth.getSession();
                if (!session) throw new Error("Usuário não autenticado");

                const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();

                // If we don't have a dashboardId, maybe we just want to load the "default" report configured in ENV?
                // But the API requires organization_id.

                const payload: any = {
                    organization_id: profile?.organization_id
                };

                if (targetWorkspaceId && targetReportId) {
                    payload.group_id = targetWorkspaceId;
                    payload.report_id = targetReportId;
                } else {
                    // If no ID provided, we rely on the API to perhaps use defaults?
                    // Looking at the API code: it throws if organization_id, group_id, or report_id are missing.
                    // So we MUST provide them. 
                    // Fallback: If no ID, try to find the "first" dashboard for this org?

                    if (!dashboardId) {
                        const { data: firstDash } = await supabase
                            .from('organization_dashboards')
                            .select('workspace_id, report_id')
                            .eq('organization_id', profile?.organization_id)
                            .order('created_at', { ascending: true })
                            .limit(1)
                            .single();

                        if (firstDash) {
                            payload.group_id = firstDash.workspace_id;
                            payload.report_id = firstDash.report_id;
                        } else {
                            // No dashboards at all?
                            setError("Nenhum dashboard encontrado.");
                            return;
                        }
                    }
                }

                const response = await fetch('/api/pbi/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Erro ao obter token");

                setConfig(data);
            } catch (err: any) {
                console.error("Error loading dashboard:", err);
                setError(err.message);
            }
        };

        loadConfig();
    }, []);

    if (error) {
        return (
            <div className="flex h-64 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 p-4">
                <p>Ocorreu um erro ao carregar o dashboard: {error}</p>
            </div>
        );
    }

    if (!config) {
        return (
            <div className="flex h-64 animate-pulse items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-400">
                <p>Carregando Power BI...</p>
            </div>
        );
    }

    return (
        <div className="h-[600px] w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <PowerBIEmbed
                embedConfig={{
                    type: 'report',
                    id: config.reportId,
                    embedUrl: config.embedUrl,
                    accessToken: config.accessToken,
                    tokenType: models.TokenType.Embed,
                    settings: {
                        panes: {
                            filters: { visible: false, expanded: false },
                            pageNavigation: { visible: false },
                        },
                        background: models.BackgroundType.Transparent,
                    },
                }}
                cssClassName="h-full w-full"
            />
        </div>
    );
};
