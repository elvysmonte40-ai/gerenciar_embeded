import React, { useState, useEffect } from 'react';
import { ProcessService } from '../../services';
import type { ProcessVersionWithRelations } from '../../../../types/processes';
import { StatusBadge } from '../shared/StatusBadge';
import { ApprovalActionPanel } from './ApprovalActionPanel';
import { supabase } from '../../../../lib/supabase';
import sanitizeHtml from 'sanitize-html';

interface ProcessViewerProps {
    processId?: string;
}

export const ProcessViewer: React.FC<ProcessViewerProps> = ({ processId }) => {
    const [version, setVersion] = useState<ProcessVersionWithRelations | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) setUserId(session.user.id);
        };
        getUser();
    }, []);

    useEffect(() => {
        const loadProcess = async () => {
            if (!processId) return;
            try {
                // Determine if ID is process ID or Code. 
                // For now assuming ID. If Process ID, need to get current version.
                // Or if it's a version ID? 
                // The URL is /processos/[id]. Usually means Process ID.

                const process = await ProcessService.getProcessById(processId);
                if (process.current_version_id) {
                    const ver = await ProcessService.getVersionById(process.current_version_id);
                    setVersion(ver);
                } else {
                    setError("Processo sem versão publicada ou rascunho ativo.");
                }

            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (processId) loadProcess();
    }, [processId]);

    if (loading) return <div className="p-8 text-center text-gray-500">Carregando...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!version) return <div className="p-8 text-center text-gray-500">Processo não encontrado.</div>;

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
            {/* Left Panel: Flow / Content */}
            <div className="flex-1 overflow-auto p-8 border-r border-gray-200">

                {userId && version.status === 'awaiting_approval' && (
                    <ApprovalActionPanel
                        version={version}
                        userId={userId}
                        onActionCompleted={() => window.location.reload()}
                    />
                )}

                <header className="mb-8 pb-4 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">{version.process.title}</h1>
                            <StatusBadge status={version.status} />
                        </div>
                        <p className="text-gray-600">{version.process.description}</p>
                    </div>
                </header>

                <div>
                    {/* Placeholder for Flow Diagram */}
                    {version.flow_data ? (
                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center text-gray-500 mb-8">
                            [Diagrama de Fluxo Visualizado Aqui]
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center text-gray-500 mb-8">
                            Sem fluxo desenhado.
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    {version.steps && version.steps.length > 0 ? (
                        version.steps.map((step) => (
                            <div key={step.id} className="prose max-w-none">
                                <h3 className="text-xl font-semibold flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand/10 text-brand text-sm font-bold">
                                        {step.order_index}
                                    </span>
                                    {step.title}
                                </h3>
                                {step.role_responsible && (
                                    <div className="text-sm text-gray-500 ml-11 mb-2">
                                        Responsável: <span className="font-medium">{step.role_responsible}</span>
                                    </div>
                                )}
                                <div
                                    className="ml-11 mt-2 text-gray-700"
                                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(step.description_html || '', {
                                        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'span', 'u', 's', 'br']),
                                        allowedAttributes: {
                                            ...sanitizeHtml.defaults.allowedAttributes,
                                            '*': ['class', 'style', 'id'],
                                            'img': ['src', 'alt', 'width', 'height']
                                        }
                                    }) }}
                                />
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 italic">Nenhum passo definido.</p>
                    )}
                </div>
            </div>

            {/* Right Panel: Attachments / Meta */}
            <div className="w-80 bg-gray-50 p-6 overflow-auto">
                <h3 className="font-semibold text-gray-900 mb-4">Anexos</h3>
                {version.attachments && version.attachments.length > 0 ? (
                    <ul className="space-y-3">
                        {version.attachments.map(att => (
                            <li key={att.id}>
                                <a href={att.file_path} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-brand hover:underline p-2 bg-white rounded border border-gray-200 shadow-sm">
                                    📄 <span className="truncate">{att.file_name}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500">Sem anexos.</p>
                )}
            </div>
        </div>
    );
};
