import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { getEmployeeMovements, type EmployeeMovement } from '../../users/services/movements';

export default function MovementsList() {
    const [movements, setMovements] = useState<EmployeeMovement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMovements();
    }, []);

    const fetchMovements = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const orgId = session.user.user_metadata.organization_id;
            if (!orgId) return;

            const data = await getEmployeeMovements(orgId);
            setMovements(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getMovementBadge = (type: string) => {
        switch (type) {
            case 'Promocao':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Promoção</span>;
            case 'Transferencia':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Transferência</span>;
            case 'Alteracao de Cargo':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Alteração de Cargo</span>;
            case 'Alteracao de Setor':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">Alteração de Setor</span>;
            case 'Alteracao Cadastral':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Alteração Cadastral</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{type}</span>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderChange = (movement: EmployeeMovement) => {
        if (movement.type === 'Alteracao de Cargo' || movement.type === 'Promocao') {
            return (
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">{movement.old_job_title?.title || '-'}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-medium text-gray-900">{movement.new_job_title?.title || '-'}</span>
                </div>
            );
        }
        if (movement.type === 'Transferencia' || movement.type === 'Alteracao de Departamento') {
            return (
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">{movement.old_department?.name || '-'}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-medium text-gray-900">{movement.new_department?.name || '-'}</span>
                </div>
            );
        }
        if (movement.type === 'Alteracao de Setor') {
            return (
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">{movement.old_sector?.name || '-'}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-medium text-gray-900">{movement.new_sector?.name || '-'}</span>
                </div>
            );
        }
        return <span className="text-sm text-gray-500">-</span>;
    };

    return (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            {loading ? (
                <div className="p-6 text-center text-gray-500">Carregando movimentações...</div>
            ) : error ? (
                <div className="p-6 text-center text-red-500">Erro ao carregar: {error}</div>
            ) : movements.length === 0 ? (
                <div className="p-6 text-center text-gray-500">Nenhuma movimentação registrada.</div>
            ) : (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Data
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Colaborador
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tipo
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                De → Para
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Responsável
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {movements.map((movement) => (
                            <tr key={movement.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(movement.created_at)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {movement.profile?.full_name || 'Usuário Desconhecido'}
                                    </div>

                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getMovementBadge(movement.type)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {renderChange(movement)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {movement.creator?.full_name || 'Sistema'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
