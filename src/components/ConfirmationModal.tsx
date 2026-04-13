import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
    loading?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    type = 'info',
    loading = false
}: ConfirmationModalProps) {
    
    // Close on ESC
    useEffect(() => {
        if (!isOpen) return;
        
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !loading) onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose, loading]);

    if (!isOpen) return null;

    const typeColors = {
        danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        warning: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400',
        info: 'bg-brand hover:bg-brand-dark focus:ring-brand',
        success: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
    };

    const typeIconColors = {
        danger: 'text-red-600 bg-red-50',
        warning: 'text-amber-600 bg-amber-50',
        info: 'text-brand bg-brand-light',
        success: 'text-emerald-600 bg-emerald-50'
    };

    return createPortal(
        <div className="fixed inset-0 z-[99999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Backdrop with premium glassmorphism */}
            <div 
                className="fixed inset-0 bg-[#00000080] backdrop-blur-[4px] transition-opacity animate-fadeIn" 
                onClick={() => !loading && onClose()}
            ></div>

            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div 
                    className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md animate-fadeIn"
                    style={{ animationDuration: '0.2s' }}
                >
                    <div className="bg-white px-6 pt-6 pb-4 sm:p-8 sm:pb-6">
                        <div className="sm:flex sm:items-start flex-col gap-4">
                            {/* Icon / Type Indicator */}
                            <div className={`mx-auto flex h-14 w-14 shrink-0 items-center justify-center rounded-full sm:mx-0 ${typeIconColors[type]}`}>
                                {type === 'danger' && (
                                    <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                    </svg>
                                )}
                                {type === 'info' && (
                                    <svg className="h-8 w-8 text-brand" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                    </svg>
                                )}
                                {type === 'success' && (
                                    <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                {type === 'warning' && (
                                    <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                    </svg>
                                )}
                            </div>

                            <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                <h3 className="text-xl font-bold leading-6 text-gray-900" id="modal-title">
                                    {title}
                                </h3>
                                <div className="mt-4">
                                    <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50/80 px-4 py-4 sm:flex sm:flex-row-reverse sm:px-8 sm:py-6 gap-3">
                        <button
                            type="button"
                            disabled={loading}
                            className={`inline-flex w-full justify-center rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all active:scale-95 disabled:opacity-70 sm:ml-0 sm:w-auto ${typeColors[type]}`}
                            onClick={onConfirm}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processando...
                                </div>
                            ) : confirmLabel}
                        </button>
                        <button
                            type="button"
                            disabled={loading}
                            className="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-40 sm:mt-0 sm:w-auto"
                            onClick={onClose}
                        >
                            {cancelLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
