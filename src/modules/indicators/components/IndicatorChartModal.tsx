
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import {
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import type { Indicator, IndicatorEntry } from '../types';
import { indicatorsService } from '../services/indicatorsService';

interface IndicatorChartModalProps {
    isOpen: boolean;
    onClose: () => void;
    indicator: Indicator | null;
}

export const IndicatorChartModal: React.FC<IndicatorChartModalProps> = ({ isOpen, onClose, indicator }) => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [data, setData] = useState<IndicatorEntry[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && indicator) {
            fetchData();
        }
    }, [isOpen, indicator, year]);

    const fetchData = async () => {
        if (!indicator) return;
        setLoading(true);
        try {
            const entries = await indicatorsService.getEntries(indicator.id, year);

            // Generate full 12 months data structure, merging with existing entries
            const fullYearData = Array.from({ length: 12 }, (_, i) => {
                const month = i + 1;
                const entry = entries.find(e => e.month === month);
                return {
                    monthName: new Date(year, i).toLocaleString('pt-BR', { month: 'short' }),
                    month,
                    realized: entry?.realized ?? null,
                    target: entry?.target ?? null,
                    budget: entry?.budget ?? null,
                };
            });

            // @ts-ignore
            setData(fullYearData);
        } catch (error) {
            console.error("Error fetching chart data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !indicator) return null;

    return createPortal(
        <div className="relative z-9999" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/50 transition-opacity backdrop-blur-sm" onClick={onClose}></div>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl border border-gray-100">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-semibold leading-6 text-text-primary" id="modal-title">
                                    {indicator.title}
                                </h3>
                                <p className="text-sm text-text-secondary mt-1 flex items-center gap-2">
                                    <span>Desempenho {year} ({indicator.unit === 'currency' ? 'R$' : indicator.unit === 'percent' ? '%' : 'Unidade'})</span>
                                    <span className="text-gray-300">|</span>
                                    <span
                                        className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${indicator.direction === 'HIGHER_BETTER'
                                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                            : 'bg-orange-50 text-orange-700 border border-orange-100'
                                            }`}
                                        title={indicator.direction === 'HIGHER_BETTER' ? 'Quanto maior, melhor' : 'Quanto menor, melhor'}
                                    >
                                        {indicator.direction === 'HIGHER_BETTER' ? (
                                            <>
                                                <ArrowUp size={12} />
                                                Maior é melhor
                                            </>
                                        ) : (
                                            <>
                                                <ArrowDown size={12} />
                                                Menor é melhor
                                            </>
                                        )}
                                    </span>
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <select
                                        value={year}
                                        onChange={(e) => setYear(Number(e.target.value))}
                                        className="appearance-none bg-white border border-gray-300 text-text-secondary py-1.5 pl-3 pr-8 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand cursor-pointer"
                                    >
                                        <option value={2024}>2024</option>
                                        <option value={2025}>2025</option>
                                        <option value={2026}>2026</option>
                                    </select>
                                    <Calendar size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                                <button
                                    type="button"
                                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                                    onClick={onClose}
                                >
                                    <span className="sr-only">Fechar</span>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-6 bg-white min-h-[400px]">
                            {loading ? (
                                <div className="h-[350px] flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                                </div>
                            ) : (
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart
                                            data={data}
                                            margin={{
                                                top: 20,
                                                right: 20,
                                                bottom: 20,
                                                left: 20,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1DFDD" />
                                            <XAxis
                                                dataKey="monthName"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#605E5C', fontSize: 12 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#605E5C', fontSize: 12 }}
                                                tickFormatter={(value) => {
                                                    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                                                    return value;
                                                }}
                                                domain={['auto', 'auto']}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#FFFFFF',
                                                    borderColor: '#E1DFDD',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                }}
                                                itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                                                labelStyle={{ color: '#605E5C', marginBottom: '8px', fontSize: '12px' }}
                                                formatter={(value: any, name: any) => {
                                                    const val = Number(value);
                                                    const decimals = indicator.decimal_places ?? 2;
                                                    const formatted = indicator.unit === 'currency'
                                                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(val)
                                                        : indicator.unit === 'percent'
                                                            ? `${val.toFixed(decimals)}%`
                                                            : val.toLocaleString('pt-BR', { maximumFractionDigits: decimals, minimumFractionDigits: decimals });

                                                    const nameMap: Record<string, string> = { realized: 'Realizado', target: 'Meta', budget: 'Orçamento' };
                                                    return [formatted, nameMap[String(name)] || name];
                                                }}
                                            />
                                            <Legend
                                                verticalAlign="top"
                                                height={36}
                                                formatter={(value) => {
                                                    const map: Record<string, string> = { realized: 'Realizado', target: 'Meta', budget: 'Orçamento' };
                                                    return <span className="text-sm font-medium text-text-secondary ml-1">{map[value]}</span>;
                                                }}
                                            />

                                            {/* Orçamento: Gray, Dotted/Dashed */}
                                            <Line
                                                type="monotone"
                                                dataKey="budget"
                                                stroke="#605E5C" // Text Secondary
                                                strokeDasharray="3 3"
                                                strokeWidth={2}
                                                dot={false}
                                                name="budget"
                                                activeDot={{ r: 6 }}
                                            />

                                            {/* Meta: Brand Blue, Dashed */}
                                            <Line
                                                type="monotone"
                                                dataKey="target"
                                                stroke="#0078D4" // Brand Blue
                                                strokeDasharray="5 5"
                                                strokeWidth={2}
                                                dot={{ r: 4, strokeWidth: 0, fill: '#0078D4' }}
                                                name="target"
                                                activeDot={{ r: 6 }}
                                            />

                                            {/* Realizado: Black, Solid */}
                                            <Line
                                                type="monotone"
                                                dataKey="realized"
                                                stroke="#201F1E" // Text Primary (Black-ish)
                                                strokeWidth={3}
                                                dot={{ r: 5, strokeWidth: 2, fill: '#FFFFFF', stroke: '#201F1E' }}
                                                name="realized"
                                                activeDot={{ r: 7, strokeWidth: 0, fill: '#201F1E' }}
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
