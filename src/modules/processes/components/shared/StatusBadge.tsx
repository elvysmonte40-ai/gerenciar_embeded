import React from 'react';
import type { ProcessStatus } from '../../../../types/processes';

interface StatusBadgeProps {
    status: ProcessStatus;
    className?: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    draft: { label: 'Rascunho', color: 'text-gray-700', bg: 'bg-gray-100' },
    awaiting_approval: { label: 'Em Aprovação', color: 'text-amber-700', bg: 'bg-amber-100' },
    published: { label: 'Publicado', color: 'text-green-700', bg: 'bg-green-100' },
    archived: { label: 'Arquivado', color: 'text-gray-500', bg: 'bg-gray-50' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
    const config = statusConfig[status] || statusConfig.draft;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color} ${className}`}>
            {config.label}
        </span>
    );
};
