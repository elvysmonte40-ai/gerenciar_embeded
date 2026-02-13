
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Indicator, IndicatorDirection, IndicatorUnit, IndicatorPeriodicity } from '../types';
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
    const [sortOrder, setSortOrder] = useState(indicatorToEdit?.sort_order || 0);
    const [decimalPlaces, setDecimalPlaces] = useState(indicatorToEdit?.decimal_places || 2);
    const [description, setDescription] = useState(indicatorToEdit?.description || '');
    const [calculationType, setCalculationType] = useState(indicatorToEdit?.calculation_type || 'SIMPLE');
    const [periodicity, setPeriodicity] = useState<IndicatorPeriodicity>(indicatorToEdit?.periodicity || 'monthly');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        if (isOpen) {
            setTitle(indicatorToEdit?.title || '');
            setUnit(indicatorToEdit?.unit || 'number');
            setDirection(indicatorToEdit?.direction || 'HIGHER_BETTER');
            setSortOrder(indicatorToEdit?.sort_order || 0);
            setDecimalPlaces(indicatorToEdit?.decimal_places || 2);
            setDescription(indicatorToEdit?.description || '');
            setCalculationType(indicatorToEdit?.calculation_type || 'SIMPLE');
            setPeriodicity(indicatorToEdit?.periodicity || 'monthly');
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

            const orgId = session.user.user_metadata.organization_id;

            const indicatorData = {
                title,
                unit,
                direction,
                sort_order: sortOrder,
                decimal_places: decimalPlaces,
                description,
                calculation_type: calculationType,
                periodicity,
            };

            if (indicatorToEdit) {
                await indicatorsService.updateIndicator(indicatorToEdit.id, indicatorData);
            } else {
                await indicatorsService.createIndicator({
                    ...indicatorData,
                    organization_id: orgId,
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
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose}></div>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
                                {indicatorToEdit ? 'Editar Indicador' : 'Novo Indicador'}
                            </h3>

                            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-8">
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título do Indicador</label>
                                        <input
                                            type="text"
                                            id="title"
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            placeholder="Ex: Faturamento Bruto"
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">Ordenação</label>
                                        <input
                                            type="number"
                                            id="sortOrder"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                            value={sortOrder}
                                            onChange={e => setSortOrder(Number(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                                    <textarea
                                        id="description"
                                        maxLength={1000}
                                        rows={3}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Descreva o objetivo deste indicador..."
                                    />
                                    <div className="text-xs text-gray-500 text-right">{description.length}/1000</div>
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
                                        <label htmlFor="periodicity" className="block text-sm font-medium text-gray-700">Periodicidade da Meta</label>
                                        <select
                                            id="periodicity"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm bg-white"
                                            value={periodicity}
                                            onChange={e => setPeriodicity(e.target.value as IndicatorPeriodicity)}
                                        >
                                            <option value="monthly">Mensal</option>
                                            <option value="annual">Anual (Acumulado)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
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
                                    <div>
                                        <label htmlFor="decimalPlaces" className="block text-sm font-medium text-gray-700">Casas Decimais</label>
                                        <input
                                            type="number"
                                            id="decimalPlaces"
                                            min={0}
                                            max={5}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                            value={decimalPlaces}
                                            onChange={e => setDecimalPlaces(Number(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="calculationType" className="block text-sm font-medium text-gray-700">Tipo de Configuração</label>
                                    <select
                                        id="calculationType"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm bg-white"
                                        value={calculationType}
                                        onChange={e => setCalculationType(e.target.value)}
                                    >
                                        <option value="SIMPLE">Simples (Inserção Direta)</option>
                                        <option value="NUMERATOR_DENOMINATOR">Numerador / Denominador</option>
                                        {/* Future: COMPOUND */}
                                    </select>
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
