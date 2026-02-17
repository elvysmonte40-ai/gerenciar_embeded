import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import type { ProcessStep } from '../../../../types/processes';
import { Trash, Plus, GripVertical, Check, X, ChevronDown } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';

interface JobTitle {
    id: string;
    title: string;
}

interface StepEditorProps {
    steps: ProcessStep[];
    onStepsChange: (steps: Partial<ProcessStep>[]) => void;
}

const MultiSelectRole: React.FC<{
    selectedRoles: string[];
    onRolesChange: (roles: string[]) => void;
    availableRoles: JobTitle[];
}> = ({ selectedRoles, onRolesChange, availableRoles }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleRole = (roleTitle: string) => {
        if (selectedRoles.includes(roleTitle)) {
            onRolesChange(selectedRoles.filter(r => r !== roleTitle));
        } else {
            onRolesChange([...selectedRoles, roleTitle]);
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <div
                className="mt-1 w-full min-h-[38px] border border-gray-300 rounded-md shadow-sm focus-within:ring-1 focus-within:ring-brand focus-within:border-brand sm:text-sm bg-white cursor-pointer px-2 py-1 flex flex-wrap gap-1 items-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedRoles.length === 0 && (
                    <span className="text-gray-400 font-normal">Selecione os cargos...</span>
                )}
                {selectedRoles.map(role => (
                    <span key={role} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand/10 text-brand">
                        {role}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleRole(role);
                            }}
                            className="ml-1 text-brand hover:text-brand-dark focus:outline-none"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}
                <div className="ml-auto pr-1">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {availableRoles.length === 0 ? (
                        <div className="px-4 py-2 text-gray-500">Nenhum cargo encontrado.</div>
                    ) : (
                        availableRoles.map(role => (
                            <div
                                key={role.id}
                                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-50 transition-colors ${selectedRoles.includes(role.title) ? 'text-brand font-medium' : 'text-gray-900'}`}
                                onClick={() => toggleRole(role.title)}
                            >
                                <span className="block truncate">{role.title}</span>
                                {selectedRoles.includes(role.title) && (
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-brand">
                                        <Check className="h-4 w-4" />
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export const StepEditor: React.FC<StepEditorProps> = ({ steps, onStepsChange }) => {
    const [localSteps, setLocalSteps] = useState<Partial<ProcessStep>[]>(steps);
    const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);

    useEffect(() => {
        const fetchJobTitles = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const orgId = session.user.user_metadata.organization_id;

            if (orgId) {
                const { data } = await supabase
                    .from('job_titles')
                    .select('id, title')
                    .eq('organization_id', orgId)
                    .eq('is_active', true)
                    .order('title');

                if (data) {
                    setJobTitles(data);
                }
            }
        };
        fetchJobTitles();
    }, []);

    const handleAddStep = () => {
        const newStep: Partial<ProcessStep> = {
            title: 'Novo Passo',
            order_index: localSteps.length + 1,
            description_html: '',
            role_responsible: ''
        };
        const updated = [...localSteps, newStep];
        setLocalSteps(updated);
        onStepsChange(updated);
    };

    const handleUpdateStep = (index: number, field: keyof ProcessStep, value: any) => {
        const updated = [...localSteps];
        updated[index] = { ...updated[index], [field]: value };
        setLocalSteps(updated);
        onStepsChange(updated);
    };

    const handleDeleteStep = (index: number) => {
        const updated = localSteps.filter((_, i) => i !== index).map((s, i) => ({
            ...s,
            order_index: i + 1 // Re-index
        }));
        setLocalSteps(updated);
        onStepsChange(updated);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Passos do Processo</h3>
                <button
                    onClick={handleAddStep}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand bg-brand/10 rounded-md hover:bg-brand/20 transition-colors"
                >
                    <Plus className="h-4 w-4" /> Adicionar Passo
                </button>
            </div>

            <div className="space-y-4">
                {localSteps.length === 0 ? (
                    <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-lg text-gray-500">
                        Nenhum passo definido. Clique em "Adicionar Passo" para começar.
                    </div>
                ) : (
                    localSteps.map((step, index) => (
                        <div key={index} id={`step-${index}`} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative group">
                            <div className="flex gap-4 items-start">
                                <div className="mt-2 text-gray-400 cursor-move">
                                    <GripVertical className="h-5 w-5" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Título</label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand sm:text-sm"
                                                value={step.title || ''}
                                                onChange={(e) => handleUpdateStep(index, 'title', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Responsável (Cargo/Papel)</label>
                                            <MultiSelectRole
                                                selectedRoles={step.role_responsible ? step.role_responsible.split(',').map(s => s.trim()).filter(Boolean) : []}
                                                onRolesChange={(roles) => handleUpdateStep(index, 'role_responsible', roles.join(', '))}
                                                availableRoles={jobTitles}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Descrição Detalhada</label>
                                        <div className="bg-white">
                                            <ReactQuill
                                                theme="snow"
                                                value={step.description_html || ''}
                                                onChange={(val) => handleUpdateStep(index, 'description_html', val)}
                                                className="h-96 mb-12" // Increased height for better editing experience
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteStep(index)}
                                    className="text-gray-400 hover:text-red-500 p-1"
                                    title="Remover passo"
                                >
                                    <Trash className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
