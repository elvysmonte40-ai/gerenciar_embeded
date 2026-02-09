
import React, { useState, useEffect } from 'react';
import type { Indicator, IndicatorEntry } from '../types';
import { indicatorsService } from '../services/indicatorsService';
import { calculatePerformance, getComprehensiveStatus } from '../utils/calculations';
import { CheckCircle, AlertTriangle, XCircle, Minus, Save, Loader2 } from 'lucide-react';

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

    // Fetch entries on mount or year change
    useEffect(() => {
        const fetchEntries = async () => {
            setLoading(true);
            try {
                const data = await indicatorsService.getEntries(indicator.id, year);
                const entriesMap: Record<number, Partial<IndicatorEntry>> = {};

                // Initialize all months with empty/null to avoid undefined checks in render
                for (let i = 1; i <= 12; i++) {
                    entriesMap[i] = {
                        month: i,
                        year: year,
                        target: null,
                        budget: null,
                        realized: null,
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

    const handleChange = (month: number, field: 'target' | 'budget' | 'realized', value: string) => {
        // Allow decimals with comma or dot
        const sanitizedValue = value.replace(/[^0-9.,-]/g, '');

        setEntries(prev => ({
            ...prev,
            [month]: {
                ...prev[month],
                [field]: sanitizedValue as any // Store as string temporarily for input control
            }
        }));
    };

    const handleBlur = async (month: number, field: 'target' | 'budget' | 'realized', value: string) => {
        // Don't save if value hasn't changed (optimization) - difficult because we store string vs number.
        // Let's just save.

        const saveKey = `${month}-${field}`;
        setSaving(saveKey);

        try {
            // Parse value
            let numValue: number | null = null;
            if (value && value.trim() !== '') {
                numValue = parseFloat(value.replace(',', '.'));
                if (isNaN(numValue)) numValue = null;
            }

            const currentEntry = entries[month];

            // Build the entry object as it should be in DB
            const entryToSave: Partial<IndicatorEntry> = {
                indicator_id: indicator.id,
                month,
                year,
                target: currentEntry?.target as number | null,
                budget: currentEntry?.budget as number | null,
                realized: currentEntry?.realized as number | null,
                [field]: numValue
            };

            // Call API
            const savedEntry = await indicatorsService.upsertEntry(entryToSave as any);

            // Update local state with the returned number value (canonical)
            setEntries(prev => ({
                ...prev,
                [month]: savedEntry
            }));

        } catch (error) {
            console.error("Error saving entry:", error);
            // Revert value? For now, we rely on refetch or error toast.
        } finally {
            setSaving(null);
        }
    };

    const getRowData = (month: number) => {
        const entry = entries[month];
        if (!entry) return { entry: null, performance: null, status: null };

        // Handle string/number conversion for calculation
        // During editing, these might be strings.
        const realized = typeof entry.realized === 'string' ? parseFloat((entry.realized as string).replace(',', '.')) : entry.realized;
        const target = typeof entry.target === 'string' ? parseFloat((entry.target as string).replace(',', '.')) : entry.target;

        if (realized == null || target == null || isNaN(realized) || isNaN(target)) {
            return { entry, performance: null, status: null };
        }


        const performance = calculatePerformance(realized, target, indicator.direction);

        // Calculate previous months' performance for accurate status
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
                    break; // Stop if data is missing, streak broken or unknown
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

    return (
        <div className="bg-white border text-text-primary border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50/50">
                <h3 className="font-semibold text-text-primary">Lançamentos Mensais</h3>
                <div className="flex items-center gap-4 bg-white px-3 py-1 rounded-md border border-gray-200 shadow-sm">
                    <button
                        onClick={() => setYear(year - 1)}
                        className="text-gray-500 hover:text-brand px-2 font-bold transition-colors"
                        title="Ano Anterior"
                        disabled={loading}
                    >
                        ←
                    </button>
                    <span className="font-semibold text-text-primary min-w-12 text-center">{year}</span>
                    <button
                        onClick={() => setYear(year + 1)}
                        className="text-gray-500 hover:text-brand px-2 font-bold transition-colors"
                        title="Próximo Ano"
                        disabled={loading}
                    >
                        →
                    </button>
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
                            <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-32 sticky left-0 bg-gray-50 z-1">Mês</th>
                            <th className="px-3 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider w-32">Orçado ({indicator.unit === 'currency' ? 'R$' : ''})</th>
                            <th className="px-3 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider w-32">Meta ({indicator.unit === 'currency' ? 'R$' : ''})</th>
                            <th className="px-3 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider w-32">Realizado ({indicator.unit === 'currency' ? 'R$' : ''})</th>
                            <th className="px-3 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider w-24">Perf. %</th>
                            <th className="px-3 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider w-24">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {MONTHS.map((monthName, index) => {
                            const monthNum = index + 1;
                            const { entry, performance, status } = getRowData(monthNum);

                            // Safe values for inputs (handle null/undefined)
                            const budgetVal = entry?.budget ?? '';
                            const targetVal = entry?.target ?? '';
                            const realizedVal = entry?.realized ?? '';

                            return (
                                <tr key={monthNum} className="hover:bg-gray-50/80 transition-colors group">
                                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-text-primary sticky left-0 bg-white group-hover:bg-gray-50 transition-colors">
                                        {monthName}
                                    </td>

                                    {/* Budget */}
                                    <td className="px-3 py-2 whitespace-nowrap relative">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className={inputClass}
                                                value={budgetVal}
                                                placeholder="—"
                                                onChange={(e) => handleChange(monthNum, 'budget', e.target.value)}
                                                onBlur={(e) => handleBlur(monthNum, 'budget', e.target.value)}
                                                disabled={loading}
                                            />
                                            {saving === `${monthNum}-budget` && (
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                    <Loader2 className="animate-spin text-brand" size={12} />
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Target */}
                                    <td className="px-3 py-2 whitespace-nowrap relative">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className={inputClass}
                                                value={targetVal}
                                                placeholder="—"
                                                onChange={(e) => handleChange(monthNum, 'target', e.target.value)}
                                                onBlur={(e) => handleBlur(monthNum, 'target', e.target.value)}
                                                disabled={loading}
                                            />
                                            {saving === `${monthNum}-target` && (
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                    <Loader2 className="animate-spin text-brand" size={12} />
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Realized */}
                                    <td className="px-3 py-2 whitespace-nowrap relative">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className={`${inputClass} font-medium ${realizedVal ? 'text-text-primary' : 'text-gray-400'}`}
                                                value={realizedVal}
                                                placeholder="—"
                                                onChange={(e) => handleChange(monthNum, 'realized', e.target.value)}
                                                onBlur={(e) => handleBlur(monthNum, 'realized', e.target.value)}
                                                disabled={loading}
                                            />
                                            {saving === `${monthNum}-realized` && (
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
