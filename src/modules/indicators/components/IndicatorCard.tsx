
import React from 'react';
import type { Indicator, CalculatedEntry } from '../types';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';

interface IndicatorCardProps {
    indicator: Indicator;
    lastEntry?: CalculatedEntry | null;
    onClick?: () => void;
}

export const IndicatorCard: React.FC<IndicatorCardProps> = ({ indicator, lastEntry, onClick }) => {
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

    const currentStatus = lastEntry ? statusConfig[lastEntry.status] : null;

    const getFormat = (val: number, unit: string) => {
        if (unit === 'currency') return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
        if (unit === 'percent') return `${val.toFixed(1)}%`;
        return val.toLocaleString('pt-BR');
    };

    // Determine trend icon (Mock logic for now, ideally comes from backend)
    const TrendIcon = lastEntry?.status === 'GREEN' ? TrendingUp : (lastEntry?.status === 'RED' ? TrendingDown : Minus);

    return (
        <a href={`/indicators/${indicator.id}`} className="block h-full no-underline">
            <div
                onClick={onClick}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-brand-light transition-all duration-200 cursor-pointer p-5 flex flex-col gap-4 group relative overflow-hidden h-full"
            >
                {/* Hover Accent Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-transparent group-hover:bg-brand transition-colors"></div>

                <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
                        <h3 className="font-semibold text-text-primary text-base leading-tight group-hover:text-brand transition-colors line-clamp-2" title={indicator.title}>
                            {indicator.title}
                        </h3>
                        <span className="text-xs text-text-secondary mt-1 block capitalize">{indicator.periodicity === 'monthly' ? 'Mensal' : indicator.periodicity}</span>
                    </div>
                    {/* Status Badge */}
                    {(lastEntry && currentStatus) && (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusConfig[lastEntry.status].bg} ${statusConfig[lastEntry.status].text} ${statusConfig[lastEntry.status].border}`}>
                            {lastEntry.performance.toFixed(1)}%
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
                                        {/* TODO: Format properly */}
                                        {lastEntry.realized} <span className="text-sm font-normal text-gray-500">{indicator.unit}</span>
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 justify-end text-xs text-text-secondary mb-0.5">
                                        <Target size={12} />
                                        <span>Meta</span>
                                    </div>
                                    <span className="text-sm font-semibold text-text-secondary">
                                        {lastEntry.target}
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
        </a>
    );
};
