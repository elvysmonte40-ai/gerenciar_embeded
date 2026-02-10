
import React, { useState, useEffect } from 'react';
import type { Indicator, IndicatorEntry } from '../types';
import { indicatorsService } from '../services/indicatorsService';
import { calculatePerformance, getComprehensiveStatus } from '../utils/calculations';
import { CheckCircle, AlertTriangle, XCircle, Minus, Loader2 } from 'lucide-react';

interface MonthlyEntryGridProps {
    indicator: Indicator;
}

const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const MonthlyEntryGrid: React.FC<MonthlyEntryGridProps> = ({ indicator }) => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [entries, setEntries] = useState<Record<number, Partial<IndicatorEntry>>>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState<string | null>(null); // "month-field" string identifier

    const isNumDen = indicator.calculation_type === 'NUMERATOR_DENOMINATOR';

    // Fetch entries on mount or year change
    useEffect(() => {
        const fetchEntries = async () => {
            setLoading(true);
            try {
                const data = await indicatorsService.getEntries(indicator.id, year);
                const entriesMap: Record<number, Partial<IndicatorEntry>> = {};

                // Initialize all months
                for (let i = 1; i <= 12; i++) {
                    entriesMap[i] = {
                        month: i,
                        year: year,
                        target: null,
                        budget: null,
                        realized: null,
                        realized_numerator: null,
                        realized_denominator: null,
                        target_numerator: null,
                        target_denominator: null,
                        budget_numerator: null,
                        budget_denominator: null,
                        numerator: null, // Legacy
                        denominator: null, // Legacy
                        indicator_id: indicator.id
                    };
                }

                data.forEach(entry => {
                    entriesMap[entry.month] = entry;
                });

                setEntries(entriesMap);
            } catch (error) {
                console.error("Error fetching entries:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEntries();
    }, [indicator.id, year]);

    const handleChange = (month: number, field: keyof IndicatorEntry, value: string) => {
        // Allow decimals with comma or dot
        const sanitizedValue = value.replace(/[^0-9.,-]/g, '');

        setEntries(prev => {
            const currentEntry = { ...prev[month] };
            // @ts-ignore
            currentEntry[field] = sanitizedValue;

            if (isNumDen) {
                const calc = (numField: keyof IndicatorEntry, denField: keyof IndicatorEntry, resField: keyof IndicatorEntry) => {
                    // Check if editing relevant fields
                    if (field !== numField && field !== denField && field !== 'numerator' && field !== 'denominator') return;

                    // Handle legacy numerator/denominator mapping to realized
                    let effectiveNumField = numField;
                    let effectiveDenField = denField;

                    if (numField === 'realized_numerator') {
                        if (field === 'numerator') effectiveNumField = 'numerator';
                        if (field === 'denominator') effectiveDenField = 'denominator';
                    }

                    const numStr = (field === effectiveNumField) ? sanitizedValue : (currentEntry[effectiveNumField] as any);
                    const denStr = (field === effectiveDenField) ? sanitizedValue : (currentEntry[effectiveDenField] as any);

                    const num = parseFloat(String(numStr).replace(',', '.'));
                    const den = parseFloat(String(denStr).replace(',', '.'));

                    if (!isNaN(num) && !isNaN(den) && den !== 0) {
                        let res = num / den;
                        if (indicator.unit === 'percent') res = res * 100;
                        // @ts-ignore
                        currentEntry[resField] = res;
                    } else if (value === '' || String(denStr) === '') {
                        // @ts-ignore
                        currentEntry[resField] = null;
                    }
                };

                calc('realized_numerator', 'realized_denominator', 'realized');
                calc('numerator', 'denominator', 'realized'); // Legacy
                calc('target_numerator', 'target_denominator', 'target');
                calc('budget_numerator', 'budget_denominator', 'budget');
            }

            return {
                ...prev,
                [month]: currentEntry
            };
        });
    };

    const handleBlur = async (month: number, field: keyof IndicatorEntry, value: string) => {
        const saveKey = `${month}-${field}`;
        setSaving(saveKey);

        try {
            let numValue: number | null = null;
            if (value && value.trim() !== '') {
                numValue = parseFloat(value.replace(',', '.'));
                if (isNaN(numValue)) numValue = null;
            }

            const currentEntry = entries[month];

            // Map inputs to DB fields
            const entryToSave: Partial<IndicatorEntry> = {
                indicator_id: indicator.id,
                month,
                year,
                target: currentEntry?.target as number | null,
                budget: currentEntry?.budget as number | null,
                realized: currentEntry?.realized as number | null,

                realized_numerator: currentEntry?.realized_numerator == null ? null : parseFloat(String(currentEntry.realized_numerator).replace(',', '.')),
                realized_denominator: currentEntry?.realized_denominator == null ? null : parseFloat(String(currentEntry.realized_denominator).replace(',', '.')),

                target_numerator: currentEntry?.target_numerator == null ? null : parseFloat(String(currentEntry.target_numerator).replace(',', '.')),
                target_denominator: currentEntry?.target_denominator == null ? null : parseFloat(String(currentEntry.target_denominator).replace(',', '.')),

                budget_numerator: currentEntry?.budget_numerator == null ? null : parseFloat(String(currentEntry.budget_numerator).replace(',', '.')),
                budget_denominator: currentEntry?.budget_denominator == null ? null : parseFloat(String(currentEntry.budget_denominator).replace(',', '.')),
            };

            // Explicit override for the field being edited ensuring parse
            // @ts-ignore
            entryToSave[field] = numValue;

            // Recalculate result fields just to be safe so we save the computed result to DB
            if (isNumDen) {
                const recalc = (nVal: number | null | undefined, dVal: number | null | undefined) => {
                    if (nVal != null && dVal != null && dVal !== 0) {
                        let res = nVal / dVal;
                        if (indicator.unit === 'percent') res = res * 100;
                        return res;
                    }
                    return null;
                }
                // Recalculate based on improved logic using the most "current" values
                const rNum = entryToSave.realized_numerator;
                const rDen = entryToSave.realized_denominator;

                entryToSave.realized = recalc(rNum, rDen);
                entryToSave.target = recalc(entryToSave.target_numerator, entryToSave.target_denominator);
                entryToSave.budget = recalc(entryToSave.budget_numerator, entryToSave.budget_denominator);
            }

            const savedEntry = await indicatorsService.upsertEntry(entryToSave as any);

            setEntries(prev => ({
                ...prev,
                [month]: savedEntry
            }));

        } catch (error) {
            console.error("Error saving entry:", error);
        } finally {
            setSaving(null);
        }
    };

    const getRowData = (month: number) => {
        const entry = entries[month];
        if (!entry) return { entry: null, performance: null, status: null };

        // Handle string/number conversion
        const realized = typeof entry.realized === 'string' ? parseFloat((entry.realized as string).replace(',', '.')) : entry.realized;
        const target = typeof entry.target === 'string' ? parseFloat((entry.target as string).replace(',', '.')) : entry.target;

        if (realized == null || target == null || isNaN(realized) || isNaN(target)) {
            return { entry, performance: null, status: null };
        }

        const performance = calculatePerformance(realized, target, indicator.direction);

        // Previous months
        const previousEntries: { performance: number }[] = [];
        for (let i = month - 1; i >= 1; i--) {
            const prevEntry = entries[i];
            if (prevEntry) {
                const pRealized = typeof prevEntry.realized === 'string' ? parseFloat((prevEntry.realized as string).replace(',', '.')) : prevEntry.realized;
                const pTarget = typeof prevEntry.target === 'string' ? parseFloat((prevEntry.target as string).replace(',', '.')) : prevEntry.target;

                if (pRealized != null && pTarget != null && !isNaN(pRealized) && !isNaN(pTarget)) {
                    const pPerf = calculatePerformance(pRealized, pTarget, indicator.direction);
                    previousEntries.push({ performance: pPerf });
                } else {
                    break;
                }
            }
        }

        const status = getComprehensiveStatus(performance, previousEntries);

        return { entry, performance, status };
    };

    const getStatusIcon = (status: string | null) => {
        if (status === 'GREEN') return <CheckCircle size={18} className="text-emerald-500" />;
        if (status === 'YELLOW') return <AlertTriangle size={18} className="text-amber-500" />;
        if (status === 'RED') return <XCircle size={18} className="text-rose-500" />;
        return <Minus size={18} className="text-gray-300" />;
    };

    const inputClass = "w-full border-gray-300 rounded-md text-sm focus:ring-brand focus:border-brand border p-1 text-right transition-colors disabled:bg-gray-50";

    const renderNumDenInput = (monthNum: number, type: 'budget' | 'target' | 'realized', val: any, fieldSuffix: string) => {
        const fieldName = `${type}_${fieldSuffix}` as keyof IndicatorEntry;
        const saveKey = `${monthNum}-${fieldName}`;

        return (
            <div className="relative min-w-[60px]">
                <input
                    type="text"
                    className={inputClass}
                    value={val}
                    placeholder="-"
                    onChange={(e) => handleChange(monthNum, fieldName, e.target.value)}
                    onBlur={(e) => handleBlur(monthNum, fieldName, e.target.value)}
                    disabled={loading}
                />
                {saving === saveKey && (
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                        <Loader2 className="animate-spin text-brand" size={10} />
                    </div>
                )}
            </div>
        )
    };

    return (
        <div className="bg-white border text-text-primary border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50/50">
                <h3 className="font-semibold text-text-primary">Lançamentos Mensais</h3>
                <div className="flex items-center gap-4 bg-white px-3 py-1 rounded-md border border-gray-200 shadow-sm">
                    <button onClick={() => setYear(year - 1)} className="text-gray-500 hover:text-brand px-2 font-bold transition-colors" disabled={loading}>←</button>
                    <span className="font-semibold text-text-primary min-w-12 text-center">{year}</span>
                    <button onClick={() => setYear(year + 1)} className="text-gray-500 hover:text-brand px-2 font-bold transition-colors" disabled={loading}>→</button>
                </div>
            </div>

            {/* Grid */}
            <div className="overflow-x-auto relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="animate-spin text-brand" size={32} />
                        <span className="text-sm text-text-secondary font-medium">Carregando dados...</span>
                    </div>
                )}

                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-32 sticky left-0 bg-gray-50 z-1 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Mês</th>

                            {/* Orçado */}
                            {isNumDen && <th className="px-2 py-3 text-center text-[10px] font-semibold text-text-secondary uppercase tracking-wider bg-gray-100/50 border-l border-gray-200">Orç. Num.</th>}
                            {isNumDen && <th className="px-2 py-3 text-center text-[10px] font-semibold text-text-secondary uppercase tracking-wider bg-gray-100/50">Orç. Den.</th>}
                            <th className={`px-3 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider w-32 ${isNumDen ? 'bg-gray-100/50 border-r border-gray-200' : ''}`}>Orçado</th>

                            {/* Meta */}
                            {isNumDen && <th className="px-2 py-3 text-center text-[10px] font-semibold text-text-secondary uppercase tracking-wider bg-blue-50/30 border-l border-gray-200">Meta Num.</th>}
                            {isNumDen && <th className="px-2 py-3 text-center text-[10px] font-semibold text-text-secondary uppercase tracking-wider bg-blue-50/30">Meta Den.</th>}
                            <th className={`px-3 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider w-32 ${isNumDen ? 'bg-blue-50/30 border-r border-gray-200' : ''}`}>Meta</th>

                            {/* Realizado */}
                            {isNumDen && <th className="px-2 py-3 text-center text-[10px] font-semibold text-text-secondary uppercase tracking-wider border-l border-gray-200">Real. Num.</th>}
                            {isNumDen && <th className="px-2 py-3 text-center text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Real. Den.</th>}
                            <th className={`px-3 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider w-32 ${isNumDen ? 'border-r border-gray-200' : ''}`}>Realizado</th>

                            <th className="px-3 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider w-24">Perf. %</th>
                            <th className="px-3 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider w-24">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {MONTHS.map((monthName, index) => {
                            const monthNum = index + 1;
                            const { entry, performance, status } = getRowData(monthNum);

                            const budgetVal = entry?.budget ?? '';
                            const targetVal = entry?.target ?? '';
                            const realizedVal = entry?.realized ?? '';

                            return (
                                <tr key={monthNum} className="hover:bg-gray-50/80 transition-colors group">
                                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-text-primary sticky left-0 bg-white group-hover:bg-gray-50 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                        {monthName}
                                    </td>

                                    {/* BUDGET SECTION */}
                                    {isNumDen && <td className="px-1 py-2 bg-gray-50/30 border-l border-gray-100">{renderNumDenInput(monthNum, 'budget', entry?.budget_numerator ?? '', 'numerator')}</td>}
                                    {isNumDen && <td className="px-1 py-2 bg-gray-50/30">{renderNumDenInput(monthNum, 'budget', entry?.budget_denominator ?? '', 'denominator')}</td>}
                                    <td className={`px-3 py-2 whitespace-nowrap relative ${isNumDen ? 'bg-gray-50/30 border-r border-gray-100' : ''}`}>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className={`${inputClass} ${isNumDen ? 'bg-gray-100 text-gray-500' : ''}`}
                                                value={typeof budgetVal === 'number' ? budgetVal.toFixed(indicator.decimal_places ?? 2) : budgetVal}
                                                placeholder="—"
                                                onChange={(e) => !isNumDen && handleChange(monthNum, 'budget', e.target.value)}
                                                onBlur={(e) => !isNumDen && handleBlur(monthNum, 'budget', e.target.value)}
                                                disabled={loading || isNumDen}
                                                readOnly={isNumDen}
                                            />
                                            {saving === `${monthNum}-budget` && !isNumDen && (
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                    <Loader2 className="animate-spin text-brand" size={12} />
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* TARGET SECTION */}
                                    {isNumDen && <td className="px-1 py-2 bg-blue-50/10 border-l border-gray-100">{renderNumDenInput(monthNum, 'target', entry?.target_numerator ?? '', 'numerator')}</td>}
                                    {isNumDen && <td className="px-1 py-2 bg-blue-50/10">{renderNumDenInput(monthNum, 'target', entry?.target_denominator ?? '', 'denominator')}</td>}
                                    <td className={`px-3 py-2 whitespace-nowrap relative ${isNumDen ? 'bg-blue-50/10 border-r border-gray-100' : ''}`}>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className={`${inputClass} ${isNumDen ? 'bg-gray-100 text-gray-500' : ''}`}
                                                value={typeof targetVal === 'number' ? targetVal.toFixed(indicator.decimal_places ?? 2) : targetVal}
                                                placeholder="—"
                                                onChange={(e) => !isNumDen && handleChange(monthNum, 'target', e.target.value)}
                                                onBlur={(e) => !isNumDen && handleBlur(monthNum, 'target', e.target.value)}
                                                disabled={loading || isNumDen}
                                                readOnly={isNumDen}
                                            />
                                            {saving === `${monthNum}-target` && !isNumDen && (
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                    <Loader2 className="animate-spin text-brand" size={12} />
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* REALIZED SECTION */}
                                    {isNumDen && <td className="px-1 py-2 border-l border-gray-100">{renderNumDenInput(monthNum, 'realized', entry?.realized_numerator ?? entry?.numerator ?? '', 'numerator')}</td>}
                                    {isNumDen && <td className="px-1 py-2">{renderNumDenInput(monthNum, 'realized', entry?.realized_denominator ?? entry?.denominator ?? '', 'denominator')}</td>}
                                    <td className={`px-3 py-2 whitespace-nowrap relative ${isNumDen ? 'border-r border-gray-100' : ''}`}>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className={`${inputClass} font-medium ${realizedVal ? 'text-text-primary' : 'text-gray-400'} ${isNumDen ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                value={typeof realizedVal === 'number' ? realizedVal.toFixed(indicator.decimal_places ?? 2) : realizedVal}
                                                placeholder="—"
                                                onChange={(e) => !isNumDen && handleChange(monthNum, 'realized', e.target.value)}
                                                onBlur={(e) => !isNumDen && handleBlur(monthNum, 'realized', e.target.value)}
                                                disabled={loading || isNumDen}
                                                readOnly={isNumDen}
                                            />
                                            {saving === `${monthNum}-realized` && !isNumDen && (
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                    <Loader2 className="animate-spin text-brand" size={12} />
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Performance */}
                                    <td className="px-3 py-3 whitespace-nowrap text-center text-sm">
                                        {performance !== null ? (
                                            <span className={`font-bold tabular-nums ${performance >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {performance.toFixed(1)}%
                                            </span>
                                        ) : (
                                            <span className="text-gray-300 font-light">—</span>
                                        )}
                                    </td>

                                    {/* Status */}
                                    <td className="px-3 py-3 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center">
                                            {getStatusIcon(status)}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
