import React, { useState } from "react";
import * as XLSX from "xlsx";
import { DataUploader } from "./DataUploader";
import { MigrationValidationService, type ValidationResult } from "../services/MigrationValidationService";
import { MigrationInsertService } from "../services/MigrationInsertService";
import { supabase } from "../../../lib/supabase";

type StepStatus = 'pending' | 'success' | 'error';

interface MigrationStepConfig {
    id: string;
    title: string;
    description: string;
    expectedColumns: string[];
    dependsOn?: string[]; // IDs of steps that must be 'success' before this one
    apiAction: (data: any[], orgId: string) => Promise<{ success: number; errors: any[] }>;
    validationAction: (data: any[]) => ValidationResult;
}

export function MigrationManager() {
    // ---------------------------------------------------------------------------
    // CONFIGURAÇÃO DOS MÓDULOS DE MIGRAÇÃO (ADICIONE NOVAS TABELAS AQUI)
    // ---------------------------------------------------------------------------
    const MIGRATION_STEPS: MigrationStepConfig[] = [
        {
            id: 'pessoais',
            title: 'Pessoas (Base)',
            description: 'Carregue a planilha básica (*cpf*, *email*, *nome*). Opcionais: *data_nascimento* e *genero*.',
            expectedColumns: ['cpf', 'email', 'nome'],
            validationAction: MigrationValidationService.validatePessoaisBase,
            apiAction: MigrationInsertService.insertPessoaisBase
        },
        {
            id: 'roles',
            title: 'Cargos',
            description: 'Carregue a planilha contendo a estrutura de cargos (*nome_cargo*).',
            expectedColumns: ['nome_cargo'],
            dependsOn: ['pessoais'],
            validationAction: MigrationValidationService.validateRoles,
            apiAction: MigrationInsertService.insertRoles
        },
        {
            id: 'departments',
            title: 'Departamentos',
            description: 'Planilha de departamentos (*nome_departamento*).',
            expectedColumns: ['nome_departamento'],
            dependsOn: ['pessoais', 'roles'],
            validationAction: MigrationValidationService.validateDepartments,
            apiAction: MigrationInsertService.insertDepartments
        },
        {
            id: 'sectors',
            title: 'Setores',
            description: 'Planilha de setores vinculados aos departamentos (*nome_setor*, *nome_departamento*).',
            expectedColumns: ['nome_setor', 'nome_departamento'],
            dependsOn: ['pessoais', 'roles', 'departments'],
            validationAction: MigrationValidationService.validateSectors,
            apiAction: MigrationInsertService.insertSectors
        },
        {
            id: 'associations',
            title: 'Associações (Tudo)',
            description: 'Relacione o *email* ou *cpf* com *cargo*, *departamento*, *setor*, *lider_email*. Opcional: *perfil_de_acesso* (O nome da permissão).',
            expectedColumns: ['email', 'cargo', 'departamento', 'setor', 'lider_email'],
            dependsOn: ['pessoais', 'roles', 'departments', 'sectors'],
            validationAction: MigrationValidationService.validateAssociations,
            apiAction: MigrationInsertService.updateAssociations
        }
    ];

    // State management
    const [activeTab, setActiveTab] = useState<string>(MIGRATION_STEPS[0].id);
    const [stepData, setStepData] = useState<Record<string, any[]>>({});
    const [stepValidation, setStepValidation] = useState<Record<string, ValidationResult>>({});
    const [stepStatus, setStepStatus] = useState<Record<string, StepStatus>>(
        MIGRATION_STEPS.reduce((acc, step) => ({ ...acc, [step.id]: 'pending' }), {})
    );

    const [isProcessing, setIsProcessing] = useState(false);
    const [globalFeedback, setGlobalFeedback] = useState<{ type: 'success' | 'error' | 'warning', message: string, details?: any[] } | null>(null);

    // Get current active step configuration
    const activeStepConfig = MIGRATION_STEPS.find(s => s.id === activeTab)!;

    // Check if a step's dependencies are met
    const areDependenciesMet = (step: MigrationStepConfig) => {
        if (!step.dependsOn || step.dependsOn.length === 0) return true;
        return step.dependsOn.every(depId => stepStatus[depId] === 'success');
    };

    const handleDataLoaded = (data: any[]) => {
        setGlobalFeedback(null);
        const result = activeStepConfig.validationAction(data);

        setStepValidation(prev => ({ ...prev, [activeStepConfig.id]: result }));
        setStepData(prev => ({ ...prev, [activeStepConfig.id]: result.validData }));

        // Reset status if they upload a new file after a success/error
        setStepStatus(prev => ({ ...prev, [activeStepConfig.id]: 'pending' }));
    };

    const handleDownloadTemplate = () => {
        const ws = XLSX.utils.aoa_to_sheet([activeStepConfig.expectedColumns]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Modelo");
        XLSX.writeFile(wb, `modelo_importacao_${activeStepConfig.id}.xlsx`);
    };

    const handleImport = async () => {
        const dataToImport = stepData[activeStepConfig.id];
        if (!dataToImport || dataToImport.length === 0) return;

        setIsProcessing(true);
        setGlobalFeedback(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Sessão inválida.");
            const orgId = session.user.user_metadata?.organization_id;

            const results = await activeStepConfig.apiAction(dataToImport, orgId);

            if (results.errors.length > 0) {
                if (results.success > 0) {
                    setGlobalFeedback({ type: 'warning', message: `Importação parcial de ${activeStepConfig.title}. ${results.success} inseridos, ${results.errors.length} erros.`, details: results.errors });
                    setStepStatus(prev => ({ ...prev, [activeStepConfig.id]: 'success' })); // Consider partial as enough to unblock next steps, or you can change this logic
                } else {
                    setGlobalFeedback({ type: 'error', message: `Falha na importação de ${activeStepConfig.title}. Nenhum registro inserido.`, details: results.errors });
                    setStepStatus(prev => ({ ...prev, [activeStepConfig.id]: 'error' }));
                }
            } else {
                setGlobalFeedback({ type: 'success', message: `${results.success} registros de ${activeStepConfig.title} importados com sucesso!` });
                setStepStatus(prev => ({ ...prev, [activeStepConfig.id]: 'success' }));

                // Limpar dados pós-sucesso e tentar avançar para próxima aba
                setStepData(prev => ({ ...prev, [activeStepConfig.id]: [] }));

                const currentIndex = MIGRATION_STEPS.findIndex(s => s.id === activeStepConfig.id);
                if (currentIndex < MIGRATION_STEPS.length - 1) {
                    setTimeout(() => setActiveTab(MIGRATION_STEPS[currentIndex + 1].id), 2000);
                }
            }

        } catch (error: any) {
            setGlobalFeedback({ type: 'error', message: `Erro fatal: ${error.message}` });
            setStepStatus(prev => ({ ...prev, [activeStepConfig.id]: 'error' }));
        } finally {
            setIsProcessing(false);
        }
    };

    const getPreviewHeaders = (data: any[]) => {
        if (!data || data.length === 0) return [];
        return Object.keys(data[0]);
    };

    const currentData = stepData[activeStepConfig.id] || [];
    const currentValidation = stepValidation[activeStepConfig.id];
    const dependenciesMet = areDependenciesMet(activeStepConfig);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
            {/* Sidebar Navigation - Menu Lateral Vertical */}
            <div className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50/50 flex flex-col pt-4">
                <div className="px-4 pb-4 border-b border-gray-200 mb-2">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Passos de Migração</h3>
                </div>
                <nav className="flex-1 space-y-2 px-3 py-2">
                    {MIGRATION_STEPS.map((step, index) => {
                        const isActive = activeTab === step.id;
                        const isSuccess = stepStatus[step.id] === 'success';
                        const hasUnmetDeps = !areDependenciesMet(step);

                        return (
                            <button
                                key={step.id}
                                onClick={() => setActiveTab(step.id)}
                                disabled={hasUnmetDeps && !isActive}
                                className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all text-left group
                                    ${isActive
                                        ? "bg-brand/10 text-brand shadow border border-brand/20 rings-2 ring-brand/10"
                                        : "text-text-secondary hover:text-text-primary hover:bg-gray-100 border border-transparent"
                                    } ${hasUnmetDeps ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                <div className="flex-1 flex overflow-hidden flex-col gap-1">
                                    <span className="truncate flex items-center">
                                        <span className={`w-6 h-6 mr-3 inline-flex items-center justify-center border rounded-full text-xs font-bold shrink-0 shadow-sm transition-colors ${isActive ? 'bg-brand text-white border-brand' : 'bg-white text-gray-500 border-gray-300 group-hover:border-gray-400'}`}>{index + 1}</span>
                                        {step.title}
                                    </span>
                                </div>
                                {isSuccess && <span className="ml-2 text-green-600 shrink-0"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></span>}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 lg:p-8 bg-white overflow-y-auto">
                {/* Feedback Global */}
                {globalFeedback && (
                    <div className={`mb-6 p-4 rounded-md text-sm ${globalFeedback.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                        globalFeedback.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
                            'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                        <div className="font-semibold flex items-center">
                            {globalFeedback.type === 'success' ? '✅' : globalFeedback.type === 'warning' ? '⚠️' : '❌'}
                            <span className="ml-2">{globalFeedback.message}</span>
                        </div>
                        {globalFeedback.details && globalFeedback.details.length > 0 && (
                            <ul className="list-disc pl-5 text-xs max-h-40 overflow-y-auto mt-2 space-y-1">
                                {globalFeedback.details.slice(0, 10).map((err, i) => <li key={i}>{typeof err === 'string' ? err : JSON.stringify(err)}</li>)}
                                {globalFeedback.details.length > 10 && <li className="font-bold text-gray-600">...e mais {globalFeedback.details.length - 10} erros ocultos.</li>}
                            </ul>
                        )}
                    </div>
                )}

                {/* Dynamic Step Content */}
                <div key={activeStepConfig.id} className="space-y-6 animate-in fade-in flex flex-col">
                    <div>
                        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                            Migração de {activeStepConfig.title}
                            {!dependenciesMet && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Bloqueado: Requer {activeStepConfig.dependsOn?.map(id => MIGRATION_STEPS.find(s => s.id === id)?.title).join(', ')}
                                </span>
                            )}
                        </h2>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1">
                            <p className="text-sm text-text-secondary">
                                {activeStepConfig.description}
                            </p>
                            <button
                                onClick={handleDownloadTemplate}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand"
                            >
                                <svg className="-ml-0.5 mr-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                Baixar Modelo XLSX
                            </button>
                        </div>
                    </div>

                    {!dependenciesMet ? (
                        <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                            <p className="text-gray-500">
                                Você precisa concluir as importações anteriores (<strong>{activeStepConfig.dependsOn?.map(id => MIGRATION_STEPS.find(s => s.id === id)?.title).join(', ')}</strong>)
                                antes de enviar arquivos para {activeStepConfig.title.toLowerCase()}.
                            </p>
                        </div>
                    ) : (
                        <>
                            <DataUploader
                                onDataLoaded={handleDataLoaded}
                                expectedColumns={activeStepConfig.expectedColumns}
                            />

                            {currentValidation?.errors && currentValidation.errors.length > 0 && (
                                <div className="p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-md text-sm">
                                    <p className="font-semibold mb-2">Erros de Validação da Planilha (Linhas Ignoradas):</p>
                                    <ul className="list-disc pl-5 max-h-32 overflow-y-auto space-y-1">
                                        {currentValidation.errors.map((e, i) => <li key={i}>Linha {e.line}: {e.error}</li>)}
                                    </ul>
                                </div>
                            )}

                            {currentData.length > 0 && (
                                <div className="space-y-4 animate-in slide-in-from-bottom-2">
                                    <div className="p-4 bg-blue-50 text-blue-800 rounded-md text-sm flex items-center justify-between">
                                        <span><span className="font-bold text-lg">{currentData.length}</span> registros prontos para validação final e importação no banco de dados.</span>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    {getPreviewHeaders(currentData).map(h => (
                                                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                                {currentData.slice(0, 5).map((row, i) => (
                                                    <tr key={i}>
                                                        {getPreviewHeaders(currentData).map(h => (
                                                            <td key={h} className="px-6 py-4 whitespace-nowrap text-gray-900 truncate max-w-[200px]" title={row[h]}>
                                                                {row[h]}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                                {currentData.length > 5 && (
                                                    <tr>
                                                        <td colSpan={getPreviewHeaders(currentData).length} className="px-6 py-2 text-center text-xs text-gray-500 bg-gray-50/50 font-medium">
                                                            ... mostrando 5 de {currentData.length} registros
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-gray-100">
                                        <button
                                            onClick={handleImport}
                                            disabled={isProcessing}
                                            className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isProcessing ? (
                                                <span className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    Processando Importação ({currentData.length})
                                                </span>
                                            ) : `Validar e Importar ${activeStepConfig.title}`}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
