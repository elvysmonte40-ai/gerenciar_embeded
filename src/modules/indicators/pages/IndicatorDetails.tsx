
import React, { useState, useEffect } from 'react';
import type { Indicator } from '../types';
import { indicatorsService } from '../services/indicatorsService';
import { MonthlyEntryGrid } from '../components/MonthlyEntryGrid';
import { IndicatorForm } from '../components/IndicatorForm';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { fetchUserPermissions, hasPermission } from '../../../utils/permissions';
import type { AppPermissions } from '../../../types/dashboard';

interface IndicatorDetailsProps {
    indicatorId: string;
}

export const IndicatorDetails: React.FC<IndicatorDetailsProps> = ({ indicatorId }) => {
    const [indicator, setIndicator] = useState<Indicator | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);

    // Permission State
    const [permissions, setPermissions] = useState<AppPermissions | null>(null);
    const [isOrgAdmin, setIsOrgAdmin] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const perms = await fetchUserPermissions(session.user.id);
                setPermissions(perms.permissions);
                setIsOrgAdmin(perms.isOrgAdmin);
            }

            const data = await indicatorsService.getIndicator(indicatorId);
            setIndicator(data);
        } catch (err: any) {
            console.error("Error fetching indicator:", err);
            setError(err.message || "Erro ao carregar indicador.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (indicatorId) {
            fetchData();
        }
    }, [indicatorId]);

    const handleDelete = async () => {
        if (!indicator) return;
        if (!confirm("Tem certeza que deseja excluir este indicador e todos os seus lançamentos?")) return;

        try {
            await indicatorsService.deleteIndicator(indicator.id);
            window.location.href = '/indicators';
        } catch (err: any) {
            alert("Erro ao excluir indicador: " + err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
            </div>
        );
    }

    if (error || !indicator) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-bold text-gray-700">Erro ao carregar dados</h2>
                <p className="text-gray-500 mt-2">{error || "Indicador não encontrado."}</p>
                <a href="/indicators" className="mt-4 inline-block text-brand hover:underline">Voltar para a lista</a>
            </div>
        );
    }

    const canEdit = hasPermission(permissions, 'indicators', 'edit', isOrgAdmin);
    const canDelete = hasPermission(permissions, 'indicators', 'delete', isOrgAdmin);
    // For entries, we usually use 'edit' permission on indicators to allow editing values

    return (
        <div className="space-y-6">
            {/* Header / Navigation */}
            <div className="flex items-center gap-4">
                <a href="/indicators" className="text-gray-500 hover:text-brand p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ArrowLeft size={20} />
                </a>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-text-primary">{indicator.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-text-secondary mt-1">
                        <span>Unidade: <span className="font-medium text-text-primary capitalize">{indicator.unit}</span></span>
                        <span>•</span>
                        <span>Direção: <span className="font-medium text-text-primary">{indicator.direction === 'HIGHER_BETTER' ? 'Maior é Melhor (↑)' : 'Menor é Melhor (↓)'}</span></span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {canEdit && (
                        <button
                            onClick={() => setIsEditFormOpen(true)}
                            className="p-2 text-gray-500 hover:text-brand hover:bg-gray-100 rounded-md transition-colors"
                            title="Editar Indicador"
                        >
                            <Edit2 size={18} />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={handleDelete}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Excluir Indicador"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content - Monthly Grid */}
            <div className="mt-8">
                <MonthlyEntryGrid indicator={indicator} canEdit={canEdit} />
            </div>

            {/* Edit Modal */}
            <IndicatorForm
                isOpen={isEditFormOpen}
                onClose={() => setIsEditFormOpen(false)}
                onSuccess={fetchData}
                indicatorToEdit={indicator}
            />
        </div>
    );
};
