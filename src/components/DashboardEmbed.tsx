import React, { useEffect, useState } from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';

interface EmbedConfig {
    accessToken: string;
    embedUrl: string;
    reportId: string;
}

export const DashboardEmbed: React.FC = () => {
    const [config, setConfig] = useState<EmbedConfig | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/pbi/token')
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setConfig(data);
            })
            .catch((err) => setError(err.message));
    }, []);

    if (error) {
        return (
            <div className="flex h-64 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700">
                <p>Error loading dashboard: {error}</p>
            </div>
        );
    }

    if (!config) {
        return (
            <div className="flex h-64 animate-pulse items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-400">
                <p>Loading Power BI...</p>
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
