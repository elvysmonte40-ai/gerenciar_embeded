
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Indicator, IndicatorDirection, IndicatorUnit } from '../types';
import { supabase } from '../../../lib/supabase';
import { indicatorsService } from '../services/indicatorsService';

interface IndicatorFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    indicatorToEdit?: Indicator | null;
}

export const IndicatorForm: React.FC<IndicatorFormProps> = ({ isOpen, onClose, onSuccess, indicatorToEdit }) => {
    const [title, setTitle] = useState(indicatorToEdit?.title || '');
    const [unit, setUnit] = useState<IndicatorUnit>(indicatorToEdit?.unit || 'number');
    const [direction, setDirection] = useState<IndicatorDirection>(indicatorToEdit?.direction || 'HIGHER_BETTER');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        if (isOpen) {
            setTitle(indicatorToEdit?.title || '');
            setUnit(indicatorToEdit?.unit || 'number');
            setDirection(indicatorToEdit?.direction || 'HIGHER_BETTER');
            setError(null);
        }
    }, [isOpen, indicatorToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Sessão expirada.");

            // Fetch org id if not editing (or just use session metadata)
            const orgId = session.user.user_metadata.organization_id;


            if (indicatorToEdit) {
                await indicatorsService.updateIndicator(indicatorToEdit.id, {
                    title,
                    unit,
                    direction
                });
            } else {
                await indicatorsService.createIndicator({
                    title,
                    unit,
                    direction,
                    organization_id: orgId,
                    periodicity: 'monthly',
                    // owner_id could be session.user.id if we want to track ownership
                });
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Error saving indicator:", err);
            setError(err.message || "Erro ao salvar indicador.");
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="relative z-9999" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
                                {indicatorToEdit ? 'Editar Indicador' : 'Novo Indicador'}
                            </h3>

                            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título do Indicador</label>
                                    <input
                                        type="text"
                                        id="title"
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="Ex: Faturamento Bruto, NPS..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unidade de Medida</label>
                                        <select
                                            id="unit"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm bg-white"
                                            value={unit}
                                            onChange={e => setUnit(e.target.value as IndicatorUnit)}
                                        >
                                            <option value="number">Número (123)</option>
                                            <option value="currency">Moeda (R$)</option>
                                            <option value="percent">Porcentagem (%)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="direction" className="block text-sm font-medium text-gray-700">Direção da Meta</label>
                                        <select
                                            id="direction"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm bg-white"
                                            value={direction}
                                            onChange={e => setDirection(e.target.value as IndicatorDirection)}
                                        >
                                            <option value="HIGHER_BETTER">Maior é melhor (↑)</option>
                                            <option value="LOWER_BETTER">Menor é melhor (↓)</option>
                                        </select>
                                    </div>
                                </div>

                                {error && (
                                    <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>
                                )}

                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="inline-flex w-full justify-center rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:col-start-2 disabled:opacity-50"
                                    >
                                        {loading ? 'Salvando...' : 'Salvar'}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                                        onClick={onClose}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
