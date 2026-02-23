import React, { useState, useEffect, Suspense } from 'react';
import { ProcessService } from '../../services';
import type { ProcessVersionWithRelations, Process } from '../../../../types/processes';
import { StatusBadge } from '../shared/StatusBadge';
import { Save, ArrowLeft, Play, Layout, List } from 'lucide-react';
import type { ProcessStep } from '../../../../types/processes';
import { supabase } from '../../../../lib/supabase';
import { fetchUserPermissions, hasPermission } from '../../../../utils/permissions';

// Lazy load editors to isolate crashes/import errors
const StepEditor = React.lazy(() => import('./StepEditor').then(m => ({ default: m.StepEditor })));
const FlowEditor = React.lazy(() => import('./FlowEditor').then(m => ({ default: m.FlowEditor })));

interface ProcessEditorProps {
    processId?: string;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("ProcessEditor Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 text-center text-red-500 bg-red-50 border border-red-200 rounded-lg m-4">
                    <h3 className="font-bold mb-2">Algo deu errado no editor.</h3>
                    <pre className="text-xs text-left overflow-auto max-h-40 bg-white p-2 border rounded">
                        {this.state.error?.toString()}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}

const ProcessEditorInner: React.FC<ProcessEditorProps> = ({ processId }) => {
    const [version, setVersion] = useState<ProcessVersionWithRelations | null>(null);
    const [process, setProcess] = useState<Process | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'flow' | 'steps'>('steps');

    // Local State for manipulation
    const [steps, setSteps] = useState<Partial<ProcessStep>[]>([]);
    const [flowData, setFlowData] = useState<any>(null);


    useEffect(() => {
        loadEditorData();
    }, [processId]);

    const loadEditorData = async () => {
        if (!processId) {
            setError("ID do processo não fornecido.");
            setLoading(false);
            return;
        }
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { permissions, isOrgAdmin } = await fetchUserPermissions(session.user.id);
                if (!hasPermission(permissions, 'processes', 'edit', isOrgAdmin)) {
                    setError("Você não tem permissão para editar processos.");
                    setLoading(false);
                    return;
                }
            }

            console.log("ProcessEditor loading data for:", processId);
            const proc = await ProcessService.getProcessById(processId);
            setProcess(proc);

            const versions = await ProcessService.getVersions(processId);
            if (versions.length > 0) {
                const latest = versions[0];
                const ver = await ProcessService.getVersionById(latest.id);
                setVersion(ver);
                setSteps(ver.steps || []);
                setFlowData(ver.flow_data || null);
            } else {
                setLoading(false); // No versions found?
                setError("Nenhuma versão encontrada para este processo.");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!version) return;
        setSaving(true);
        try {
            const stepsToSave = steps.map((s, index) => ({
                ...s,
                order_index: index + 1,
                process_version_id: version.id,
            }));

            await ProcessService.saveSteps(version.id, stepsToSave);
            await ProcessService.updateVersion(version.id, { flow_data: flowData });

            const updatedVer = await ProcessService.getVersionById(version.id);
            setVersion(updatedVer);
            setSteps(updatedVer.steps || []);
            alert('Salvo com sucesso!');
        } catch (err: any) {
            console.error(err);
            alert('Erro ao salvar: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!version) return;
        if (!confirm('Deseja enviar esta versão para aprovação/publicação?')) return;

        try {
            await ProcessService.requestApproval(version.id);
            alert('Solicitação de aprovação enviada!');
            window.location.reload();
        } catch (err: any) {
            alert('Erro: ' + err.message);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-full text-gray-500">Carregando editor...</div>;
    if (error) return <div className="flex items-center justify-center h-full text-red-500 bg-red-50 p-4 m-4 rounded">{error}</div>;
    if (!version || !process) return <div className="flex items-center justify-center h-full text-gray-500">Dados não encontrados.</div>;

    return (
        <ErrorBoundary>
            <div className="flex flex-col h-full bg-gray-100 overflow-hidden">
                {/* Toolbar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <a href="/processes" className="text-gray-400 hover:text-gray-600 transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                {process.title} <span className="text-gray-400 text-sm font-normal">v{version.version_number}</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <StatusBadge status={version.status} />
                                <span className="text-xs text-gray-400">
                                    {version.status === 'draft' ? 'Rascunho editável' : 'Leitura'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-100 p-1 rounded-lg mr-4">
                            <button
                                onClick={() => setActiveTab('steps')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${activeTab === 'steps' ? 'bg-white shadow-sm text-brand' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <List className="h-4 w-4" /> Passos
                            </button>
                            <button
                                onClick={() => setActiveTab('flow')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${activeTab === 'flow' ? 'bg-white shadow-sm text-brand' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Layout className="h-4 w-4" /> Fluxo
                            </button>
                        </div>

                        {version.status === 'draft' && (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium disabled:opacity-50 transition-colors"
                                >
                                    <Save className="h-4 w-4" /> {saving ? 'Salvando...' : 'Salvar'}
                                </button>

                                <button
                                    onClick={handlePublish}
                                    className="flex items-center gap-2 px-4 py-2 text-white bg-brand rounded-lg hover:bg-brand-dark text-sm font-medium transition-colors"
                                >
                                    <Play className="h-4 w-4" /> Publicar
                                </button>
                            </>
                        )}
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden flex relative">
                    <Suspense fallback={<div className="flex items-center justify-center w-full h-full text-gray-400">Carregando componente...</div>}>
                        {activeTab === 'steps' ? (
                            <div className="flex h-full w-full bg-gray-50">
                                <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto shrink-0 flex flex-col h-full">
                                    <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Navegação
                                        </h3>
                                    </div>
                                    <nav className="flex-1 p-2 space-y-1">
                                        {steps.map((step, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    const el = document.getElementById(`step-${index}`);
                                                    if (el) {
                                                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    }
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-2 group"
                                            >
                                                <span className="w-5 h-5 flex items-center justify-center bg-gray-100 text-gray-500 text-xs rounded group-hover:bg-brand/10 group-hover:text-brand transition-colors shrink-0">
                                                    {index + 1}
                                                </span>
                                                <span className="truncate">{step.title || 'Novo Passo'}</span>
                                            </button>
                                        ))}
                                        {steps.length === 0 && (
                                            <div className="px-4 py-8 text-center text-xs text-gray-400">
                                                Nenhum passo criado.
                                            </div>
                                        )}
                                    </nav>
                                </aside>
                                <div className="flex-1 p-8 overflow-y-auto h-full scroll-smooth">
                                    <div className="w-full max-w-[95%] mx-auto bg-white rounded-lg shadow-sm min-h-[500px] p-8">
                                        <StepEditor
                                            steps={steps as any}
                                            onStepsChange={(newSteps: Partial<ProcessStep>[]) => setSteps(newSteps)}
                                            readOnly={version.status !== 'draft'}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 bg-slate-50 relative h-full w-full">
                                <FlowEditor
                                    initialFlowData={flowData}
                                    onFlowChange={setFlowData}
                                    readOnly={version.status !== 'draft'}
                                />
                            </div>
                        )}
                    </Suspense>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export const ProcessEditor: React.FC<ProcessEditorProps> = (props) => (
    <ErrorBoundary>
        <ProcessEditorInner {...props} />
    </ErrorBoundary>
);
