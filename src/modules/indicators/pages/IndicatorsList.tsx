import React, { useState, useEffect } from 'react';
import { IndicatorCard } from '../components/IndicatorCard';
import { IndicatorForm } from '../components/IndicatorForm';
import { IndicatorChartModal } from '../components/IndicatorChartModal';
import { Plus, Search, Filter, RefreshCw } from 'lucide-react';
import { indicatorsService } from '../services/indicatorsService';
import { supabase } from '../../../lib/supabase';
import type { Indicator, CalculatedEntry } from '../types';
import { fetchUserPermissions, hasPermission } from '../../../utils/permissions';
import type { AppPermissions } from '../../../types/dashboard';

export const IndicatorsList: React.FC = () => {
    const [indicators, setIndicators] = useState<(Indicator & { lastEntry: CalculatedEntry | null })[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);

    // Permission State
    const [permissions, setPermissions] = useState<AppPermissions | null>(null);
    const [isOrgAdmin, setIsOrgAdmin] = useState(false);

    const fetchIndicators = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.user_metadata?.organization_id) {
                // Fetch Permissions
                const perms = await fetchUserPermissions(session.user.id);
                setPermissions(perms.permissions);
                setIsOrgAdmin(perms.isOrgAdmin);

                const data = await indicatorsService.getIndicatorsWithPerformance(session.user.user_metadata.organization_id);
                // @ts-ignore
                setIndicators(data);
            }
        } catch (error) {
            console.error("Error fetching indicators:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIndicators();
    }, []);

    const filteredIndicators = indicators.filter(ind =>
        ind.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const canCreate = hasPermission(permissions, 'indicators', 'create', isOrgAdmin);
    const canEdit = hasPermission(permissions, 'indicators', 'edit', isOrgAdmin);

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchIndicators}
                        className="text-text-secondary hover:text-brand p-2 rounded-md hover:bg-gray-100 transition-colors"
                        title="Atualizar"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    {canCreate && (
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="bg-brand text-white text-sm px-4 py-2.5 rounded-lg hover:bg-brand-dark flex items-center gap-2 font-semibold shadow-sm hover:shadow transition-all"
                        >
                            <Plus size={18} />
                            Novo Indicador
                        </button>
                    )}
                </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar indicador..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand transition-all"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-text-secondary hover:bg-gray-50 hover:text-text-primary transition-colors">
                    <Filter size={18} />
                    Filtros
                </button>
            </div>

            {/* Grid Section */}
            {loading ? (
                <div className="py-12 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                </div>
            ) : filteredIndicators.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredIndicators.map((ind) => (
                        <IndicatorCard
                            key={ind.id}
                            indicator={ind}
                            lastEntry={ind.lastEntry}
                            onClick={() => setSelectedIndicator(ind)}
                            canEdit={canEdit}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    {searchTerm ? (
                        <>
                            <p className="text-text-secondary">Nenhum indicador encontrado para "{searchTerm}".</p>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-brand text-sm font-medium hover:underline mt-2"
                            >
                                Limpar busca
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="text-text-secondary">Você ainda não criou nenhum indicador.</p>
                            {canCreate && (
                                <button
                                    onClick={() => setIsFormOpen(true)}
                                    className="text-brand text-sm font-medium hover:underline mt-2"
                                >
                                    Criar meu primeiro indicador
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}

            <IndicatorForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={fetchIndicators}
            />

            <IndicatorChartModal
                isOpen={!!selectedIndicator}
                onClose={() => setSelectedIndicator(null)}
                indicator={selectedIndicator}
            />
        </div>
    );
};
