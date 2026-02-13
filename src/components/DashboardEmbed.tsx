import React, { useEffect, useState } from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';
import { supabase } from '../lib/supabase';

interface EmbedConfig {
    accessToken: string;
    embedUrl: string;
    reportId: string;
    canExportData: boolean;
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


                // If we don't have a dashboardId, maybe we just want to load the "default" report configured in ENV?
                // But the API requires organization_id.

                const { data: { session } } = await supabase.auth.getSession();
                if (!session) throw new Error("Usuário não autenticado");

                const { data: profile } = await supabase.from('profiles').select('organization_id, can_export_data').eq('id', session.user.id).single();

                if (!profile?.organization_id) {
                    throw new Error("Usuário sem organização vinculada.");
                }

                const payload: any = {
                    organization_id: profile.organization_id
                };

                if (targetWorkspaceId && targetReportId) {
                    payload.group_id = targetWorkspaceId;
                    payload.report_id = targetReportId;
                } else if (!dashboardId) {
                    // Try to find the "first" dashboard for this org only if no specific ID was requested
                    const { data: firstDash } = await supabase
                        .from('organization_dashboards')
                        .select('workspace_id, report_id')
                        .eq('organization_id', profile.organization_id)
                        .order('created_at', { ascending: true })
                        .limit(1)
                        .single();

                    if (firstDash) {
                        payload.group_id = firstDash.workspace_id;
                        payload.report_id = firstDash.report_id;
                    }
                }

                // Final validation before API call
                if (!payload.organization_id || !payload.group_id || !payload.report_id) {
                    // If we requested a specific ID and fell through here, it means it wasn't valid/found.
                    // If we didn't request an ID and found no default, same issue.
                    throw new Error("Dashboard não encontrado ou configuração incompleta.");
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

                setConfig({
                    ...data,
                    canExportData: profile?.can_export_data
                });
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
        <div className="h-full w-full overflow-hidden bg-white">
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
                        // background: models.BackgroundType.Transparent,
                        extensions: !config.canExportData ? [
                            {
                                command: {
                                    name: "exportData",
                                    displayOption: models.CommandDisplayOption.Hidden
                                }
                            } as any
                        ] : undefined,
                    },
                }}
                cssClassName="h-full w-full"
            />
        </div>
    );
};
