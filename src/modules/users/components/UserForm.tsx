import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../../lib/supabase';

interface UserProfile {
    id: string;
    full_name: string;
    role: string;
    status: string;
    created_at: string;
    organization_id: string;
}

interface UserFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userToEdit?: UserProfile | null;
}

export default function UserForm({ isOpen, onClose, onSuccess, userToEdit }: UserFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('user');

    useEffect(() => {
        if (isOpen) {
            if (userToEdit) {
                setFullName(userToEdit.full_name || '');
                setRole(userToEdit.role || 'user');
                setEmail(''); // Email is not editable and not available in the list view
            } else {
                setFullName('');
                setEmail('');
                setRole('user');
            }
            setError(null);
        }
    }, [isOpen, userToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (userToEdit) {
                // Edit Mode - Direct Update
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        full_name: fullName,
                        role: role
                    })
                    .eq('id', userToEdit.id);

                if (updateError) throw updateError;

            } else {
                // Create Mode - Invite API
                // Get session for token
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    throw new Error("Sessão expirada. Faça login novamente.");
                }

                const response = await fetch('/api/users/invite', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                    },
                    body: JSON.stringify({
                        fullName,
                        email,
                        role,
                        organization_id: session.user.user_metadata.organization_id
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Erro ao convidar usuário');
                }
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Error saving user:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="relative z-[9999]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        {userToEdit ? 'Editar Usuário' : 'Adicionar Usuário'}
                                    </h3>
                                    <div className="mt-4">
                                        <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                                                <input
                                                    type="text"
                                                    id="fullName"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                                    value={fullName}
                                                    onChange={e => setFullName(e.target.value)}
                                                />
                                            </div>

                                            {!userToEdit && (
                                                <div>
                                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        required
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                                        value={email}
                                                        onChange={e => setEmail(e.target.value)}
                                                    />
                                                </div>
                                            )}

                                            <div>
                                                <label htmlFor="role" className="block text-sm font-medium text-gray-700">Função</label>
                                                <select
                                                    id="role"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm bg-white"
                                                    value={role}
                                                    onChange={e => setRole(e.target.value)}
                                                >
                                                    <option value="user">Colaborador</option>
                                                    <option value="admin">Administrador</option>
                                                </select>
                                            </div>

                                            {error && (
                                                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>
                                            )}
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                form="user-form"
                                disabled={loading}
                                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand text-base font-medium text-white hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand sm:ml-3 sm:w-auto sm:text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Salvando...' : (userToEdit ? 'Salvar Alterações' : 'Adicionar')}
                            </button>
                            <button
                                type="button"
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                onClick={onClose}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
