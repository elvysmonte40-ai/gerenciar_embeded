
import React from 'react';
import type { Indicator, CalculatedEntry } from '../types';
import { TrendingUp, TrendingDown, Minus, Target, Edit } from 'lucide-react';

interface IndicatorCardProps {
    indicator: Indicator;
    lastEntry?: CalculatedEntry | null;
    onClick?: () => void;
    canEdit?: boolean;
}


export const IndicatorCard: React.FC<IndicatorCardProps> = ({ indicator, lastEntry, onClick, canEdit = false }) => {
    const statusConfig = {
        GREEN: {
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
            border: 'border-emerald-200',
            dot: 'bg-emerald-500',
            label: 'Meta Atingida'
        },
        YELLOW: {
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            border: 'border-amber-200',
            dot: 'bg-amber-500',
            label: 'Atenção'
        },
        RED: {
            bg: 'bg-rose-50',
            text: 'text-rose-700',
            border: 'border-rose-200',
            dot: 'bg-rose-500',
            label: 'Crítico'
        },
    };

    // Determine values to show (Monthly vs Accumulated)
    const isAnnual = indicator.periodicity === 'annual';
    const realized = isAnnual && lastEntry?.accumulated ? lastEntry.accumulated.realized : lastEntry?.realized;
    const target = isAnnual && lastEntry?.accumulated ? lastEntry.accumulated.target : lastEntry?.target;
    const performance = isAnnual && lastEntry?.accumulated ? lastEntry.accumulated.performance : lastEntry?.performance;

    // Use comprehensive status if available, otherwise fallback (accumulated status logic might need refinement in service, but for now we use the main status or calculate new one?)
    // Actually, service only calculates accumulated performance, not status.
    // For MVP, if annual, we might want to recalculate status based on accumulated performance.
    // But let's use the performance value to stick with the simple color logic for now or just reuse the logic if possible.
    // If it's annual, the status in lastEntry might be for the month. We should probably use the accumulated performance to determine color.
    // However, I didn't export getComprehensiveStatus to frontend.
    // Let's rely on the passed status for now, or if I updated service to set status based on accumulation?
    // In service I did: calculatedEntry = { ...accumulated: { ... } }. I didn't update the top-level status.
    // Let's assume the user wants to see the MONTHLY status primarily, but ACCUMULATED values?
    // "A 'frequencia' de meta deve ser usada para trazer o valor acumulado do ano... Esses valores devem ser plotados"
    // So for the Big Numbers, show Accumulated.

    // Status Logic for UI color:
    // If Annual, maybe we should show the status of the accumulated performance?
    // Since I don't have the status logic here, I will use the monthly status color for the card border/badge, but show accumulated values.
    // OR, I can simple check performance thresholds if I knew them.
    // Let's stick to using `lastEntry.status` for the visual style for now to avoid duplications, but label it clearly.

    const currentStatus = lastEntry ? statusConfig[lastEntry.status] : null;

    const getFormat = (val: number | null | undefined, unit: string) => {
        if (val === null || val === undefined) return '-';
        const decimals = indicator.decimal_places ?? 2;

        if (unit === 'currency') return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(val);
        if (unit === 'percent') return `${val.toFixed(decimals)}%`;
        return val.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };

    // Determine trend icon (Mock logic for now, ideally comes from backend)
    const TrendIcon = lastEntry?.status === 'GREEN' ? TrendingUp : (lastEntry?.status === 'RED' ? TrendingDown : Minus);

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-brand-light transition-all duration-200 cursor-pointer p-5 flex flex-col gap-4 group relative overflow-hidden h-full"
        >
            {/* Hover Accent Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-transparent group-hover:bg-brand transition-colors"></div>

            {/* Edit Icon - Navigates to details page */}
            {/* Edit Icon - Navigates to details page */}
            {canEdit && (
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <a
                        href={`/indicators/${indicator.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 bg-white border border-gray-200 rounded-md shadow-sm text-gray-400 hover:text-brand hover:border-brand-light flex items-center justify-center transition-colors"
                    >
                        <Edit size={14} />
                    </a>
                </div>
            )}

            <div className="flex justify-between items-start pt-2">
                <div className="flex-1 pr-2">
                    <h3 className="font-semibold text-text-primary text-base leading-tight group-hover:text-brand transition-colors line-clamp-2" title={indicator.title}>
                        {indicator.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-text-secondary capitalize">
                            {isAnnual ? 'Meta Anual' : 'Meta Mensal'}
                        </span>
                        {isAnnual && (
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 uppercase font-semibold">
                                Acumulado
                            </span>
                        )}
                    </div>
                </div>
                {/* Status Badge */}
                {(lastEntry && currentStatus) && (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusConfig[lastEntry.status].bg} ${statusConfig[lastEntry.status].text} ${statusConfig[lastEntry.status].border}`}>
                        {getFormat(performance, 'percent')}
                    </span>
                )}
            </div>

            <div className="mt-auto pt-2">
                {lastEntry && currentStatus ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Resultado</span>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                                <span className={`w-2 h-2 rounded-full ${statusConfig[lastEntry.status].dot}`}></span>
                                {statusConfig[lastEntry.status].label}
                            </div>
                        </div>

                        <div className="flex items-end justify-between">
                            <div>
                                <span className="text-2xl font-bold text-text-primary tracking-tight block">
                                    {getFormat(realized, indicator.unit)} <span className="text-sm font-normal text-gray-500">{indicator.unit === 'number' && ''}</span>
                                </span>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 justify-end text-xs text-text-secondary mb-0.5">
                                    <Target size={12} />
                                    <span>Meta</span>
                                </div>
                                <span className="text-sm font-semibold text-text-secondary">
                                    {getFormat(target, indicator.unit)}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 bg-gray-50/50 rounded-lg border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2">
                        <Minus className="text-gray-300" />
                        <span className="text-xs text-text-secondary font-medium">Aguardando dados</span>
                    </div>
                )}
            </div>
        </div>
    );
};

