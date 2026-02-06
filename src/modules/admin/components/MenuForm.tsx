import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../../lib/supabase';
import type { OrganizationMenu } from '../../../types/dashboard';
import MenuIcon, { AVAILABLE_ICONS } from '../../../components/MenuIcon';

interface MenuFormProps {
    menu?: OrganizationMenu | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function MenuForm({ menu, isOpen, onClose, onSuccess }: MenuFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [iconName, setIconName] = useState('');
    const [orderIndex, setOrderIndex] = useState(0);
    const [useCustomImage, setUseCustomImage] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            if (menu) {
                // Edit mode
                setTitle(menu.title);
                setOrderIndex(menu.order_index);
                if (menu.icon_url) {
                    setUseCustomImage(true);
                    setPreviewUrl(menu.icon_url);
                    setIconName('');
                } else {
                    setUseCustomImage(false);
                    setIconName(menu.icon_name || AVAILABLE_ICONS[0]);
                    setPreviewUrl(null);
                }
            } else {
                // Create mode
                setTitle('');
                setOrderIndex(0);
                setUseCustomImage(false);
                setIconName(AVAILABLE_ICONS[0]);
                setPreviewUrl(null);
            }
            setImageFile(null);
            setError(null);
        }
    }, [isOpen, menu]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);

            // Create preview
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Usuário não autenticado");

            // Get user's org
            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', session.user.id)
                .single();

            if (!profile?.organization_id) throw new Error("Organização não encontrada");

            let finalIconUrl = menu?.icon_url || null;
            let finalIconName = useCustomImage ? null : iconName;

            // Upload image if needed
            if (useCustomImage && imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${profile.organization_id}/${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('menu-icons')
                    .upload(fileName, imageFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('menu-icons')
                    .getPublicUrl(fileName);

                finalIconUrl = publicUrl;
            } else if (!useCustomImage) {
                finalIconUrl = null;
            }

            const payload = {
                organization_id: profile.organization_id,
                title,
                icon_name: finalIconName,
                icon_url: finalIconUrl,
                order_index: orderIndex,
                updated_at: new Date().toISOString(),
            };

            let queryError;

            if (menu?.id) {
                // Update
                const { error } = await supabase
                    .from('organization_menus')
                    .update(payload)
                    .eq('id', menu.id);
                queryError = error;
            } else {
                // Insert
                const { error } = await supabase
                    .from('organization_menus')
                    .insert(payload);
                queryError = error;
            }

            if (queryError) throw queryError;

            onSuccess();
            onClose();

        } catch (err: any) {
            console.error("Error saving menu:", err);
            setError(err.message || "Erro ao salvar menu");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="relative z-9999" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Background backdrop */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        {menu ? 'Editar Menu' : 'Novo Menu'}
                                    </h3>

                                    <form id="menu-form" onSubmit={handleSubmit} className="mt-4 space-y-4">
                                        <div>
                                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
                                            <input
                                                type="text"
                                                id="title"
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                                value={title}
                                                onChange={e => setTitle(e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="orderIndex" className="block text-sm font-medium text-gray-700">Ordem</label>
                                            <input
                                                type="number"
                                                id="orderIndex"
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                                value={orderIndex}
                                                onChange={e => setOrderIndex(Number(e.target.value))}
                                            />
                                        </div>

                                        <div>
                                            <span className="block text-sm font-medium text-gray-700 mb-2">Ícone</span>
                                            <div className="flex items-center space-x-4 mb-3">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="radio"
                                                        className="form-radio text-brand"
                                                        name="iconType"
                                                        checked={!useCustomImage}
                                                        onChange={() => setUseCustomImage(false)}
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">Biblioteca Lucide</span>
                                                </label>
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="radio"
                                                        className="form-radio text-brand"
                                                        name="iconType"
                                                        checked={useCustomImage}
                                                        onChange={() => setUseCustomImage(true)}
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">Imagem Personalizada</span>
                                                </label>
                                            </div>

                                            {!useCustomImage ? (
                                                <div className="grid grid-cols-5 gap-2 border p-2 rounded-md">
                                                    {AVAILABLE_ICONS.map(icon => (
                                                        <div
                                                            key={icon}
                                                            className={`flex flex-col items-center justify-center p-2 rounded cursor-pointer hover:bg-gray-100 ${iconName === icon ? 'bg-brand/10 border border-brand' : ''}`}
                                                            onClick={() => setIconName(icon)}
                                                        >
                                                            <MenuIcon iconName={icon} className="h-6 w-6 text-gray-600" />
                                                            <span className="text-[10px] mt-1 truncate w-full text-center">{icon}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                                    <div className="space-y-1 text-center">
                                                        {previewUrl ? (
                                                            <div className="mx-auto h-16 w-16 mb-4 relative group">
                                                                <img src={previewUrl} alt="Preview" className="h-16 w-16 object-cover rounded-md" />
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.preventDefault(); setImageFile(null); setPreviewUrl(null); }}
                                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                                                                >
                                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        )}
                                                        <div className="flex text-sm text-gray-600 justify-center">
                                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-brand hover:text-brand-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand">
                                                                <span>Upload um arquivo</span>
                                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                                                            </label>
                                                        </div>
                                                        <p className="text-xs text-gray-500">PNG, JPG até 2MB (1:1)</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {error && (
                                            <div className="text-red-600 text-sm">{error}</div>
                                        )}
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                form="menu-form"
                                disabled={loading}
                                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand text-base font-medium text-white hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand sm:ml-3 sm:w-auto sm:text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Salvando...' : 'Salvar'}
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
