import React, { useState } from 'react';
import { ProcessService } from '../../services';
import { Check, X } from 'lucide-react';
import type { ProcessVersionWithRelations } from '../../../../types/processes';

interface ApprovalActionPanelProps {
    version: ProcessVersionWithRelations;
    userId: string;
    onActionCompleted: () => void;
}

export const ApprovalActionPanel: React.FC<ApprovalActionPanelProps> = ({ version, userId, onActionCompleted }) => {
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    // Check if user is a pending approver
    const approverRecord = version.approvers?.find(a => a.user_id === userId && a.status === 'pending');

    if (!approverRecord) return null;

    const handleAction = async (status: 'approved' | 'rejected') => {
        if (status === 'rejected' && !comment.trim()) {
            alert('É obrigatório justificar a rejeição.');
            return;
        }

        if (!confirm(`Tem certeza que deseja ${status === 'approved' ? 'APROVAR' : 'REJEITAR'} esta versão?`)) return;

        setLoading(true);
        try {
            await ProcessService.reviewVersion(version.id, userId, status, comment);
            onActionCompleted();
        } catch (error: any) {
            console.error(error);
            alert('Erro: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <h4 className="text-amber-800 font-medium mb-2">Aprovação Pendente</h4>
            <p className="text-sm text-amber-700 mb-4">
                Você foi designado para aprovar esta versão do processo. Por favor, revise o conteúdo e tome uma ação.
            </p>

            <textarea
                className="w-full p-2 border border-amber-300 rounded mb-4 text-sm focus:ring-amber-500 focus:border-amber-500"
                placeholder="Comentários/Observações (Obrigatório para rejeição)"
                rows={3}
                value={comment}
                onChange={e => setComment(e.target.value)}
            />

            <div className="flex gap-3">
                <button
                    onClick={() => handleAction('approved')}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded shadow-sm hover:bg-green-700 flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                >
                    <Check className="h-4 w-4" /> Aprovar
                </button>
                <button
                    onClick={() => handleAction('rejected')}
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded shadow-sm hover:bg-red-700 flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                >
                    <X className="h-4 w-4" /> Rejeitar
                </button>
            </div>
        </div>
    );
};
