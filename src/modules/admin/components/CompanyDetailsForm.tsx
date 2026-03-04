import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export function CompanyDetailsForm() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const [formData, setFormData] = useState({
        name: '',
        cnpj: '',
        segment: '',
        billing_email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postal_code: ''
    });

    useEffect(() => {
        loadCompanyData();
    }, []);

    const loadCompanyData = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();

            if (profile?.organization_id) {
                const { data: org, error } = await supabase
                    .from('organizations')
                    .select('name, cnpj, segment, billing_email, phone, address, city, state, postal_code')
                    .eq('id', profile.organization_id)
                    .single();

                if (error) throw error;
                if (org) {
                    setFormData({
                        name: org.name || '',
                        cnpj: org.cnpj || '',
                        segment: org.segment || '',
                        billing_email: org.billing_email || '',
                        phone: org.phone || '',
                        address: org.address || '',
                        city: org.city || '',
                        state: org.state || '',
                        postal_code: org.postal_code || ''
                    });
                }
            }
        } catch (error) {
            console.error('Error loading company data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Não autenticado");

            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();

            if (!profile?.organization_id) throw new Error("Sem organização associada");

            const { error } = await supabase
                .from('organizations')
                .update({
                    name: formData.name,
                    cnpj: formData.cnpj,
                    segment: formData.segment,
                    billing_email: formData.billing_email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    postal_code: formData.postal_code
                })
                .eq('id', profile.organization_id);

            if (error) throw error;

            setMessage({ text: 'Dados atualizados com sucesso.', type: 'success' });

            // Dispatch event so that the header updates its org name
            window.dispatchEvent(new Event('profile-updated'));

        } catch (error: any) {
            console.error('Error saving company data:', error);
            setMessage({ text: `Erro ao salvar: ${error.message}`, type: 'error' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        }
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Carregando dados da empresa...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {message.text && (
                <div className={`p-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'} border`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Nome fantasia */}
                <div className="sm:col-span-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Fantasia / Razão Social</label>
                    <div className="mt-1">
                        <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-brand focus:border-brand block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                        />
                    </div>
                </div>

                {/* CNPJ */}
                <div className="sm:col-span-2">
                    <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">CNPJ</label>
                    <div className="mt-1">
                        <input
                            type="text"
                            name="cnpj"
                            id="cnpj"
                            value={formData.cnpj}
                            onChange={handleChange}
                            placeholder="00.000.000/0000-00"
                            className="shadow-sm focus:ring-brand focus:border-brand block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                        />
                    </div>
                </div>

                {/* Segmento */}
                <div className="sm:col-span-3">
                    <label htmlFor="segment" className="block text-sm font-medium text-gray-700">Segmento de Atuação</label>
                    <div className="mt-1">
                        <input
                            type="text"
                            name="segment"
                            id="segment"
                            value={formData.segment}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-brand focus:border-brand block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                        />
                    </div>
                </div>

                {/* E-mail de Cobranças */}
                <div className="sm:col-span-3">
                    <label htmlFor="billing_email" className="block text-sm font-medium text-gray-700">E-mail (Cobranças/Contato)</label>
                    <div className="mt-1">
                        <input
                            type="email"
                            name="billing_email"
                            id="billing_email"
                            value={formData.billing_email}
                            onChange={handleChange}
                            placeholder="financeiro@empresa.com"
                            className="shadow-sm focus:ring-brand focus:border-brand block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                        />
                    </div>
                </div>

                {/* Telefone */}
                <div className="sm:col-span-3">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                    <div className="mt-1">
                        <input
                            type="text"
                            name="phone"
                            id="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-brand focus:border-brand block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                        />
                    </div>
                </div>

                {/* Endereço */}
                <div className="sm:col-span-6">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Endereço Completo</label>
                    <div className="mt-1">
                        <input
                            type="text"
                            name="address"
                            id="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-brand focus:border-brand block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                        />
                    </div>
                </div>

                {/* Cidade */}
                <div className="sm:col-span-2">
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">Cidade</label>
                    <div className="mt-1">
                        <input
                            type="text"
                            name="city"
                            id="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-brand focus:border-brand block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                        />
                    </div>
                </div>

                {/* Estado */}
                <div className="sm:col-span-2">
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">Estado</label>
                    <div className="mt-1">
                        <input
                            type="text"
                            name="state"
                            id="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-brand focus:border-brand block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                        />
                    </div>
                </div>

                {/* CEP */}
                <div className="sm:col-span-2">
                    <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">CEP</label>
                    <div className="mt-1">
                        <input
                            type="text"
                            name="postal_code"
                            id="postal_code"
                            value={formData.postal_code}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-brand focus:border-brand block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-end">
                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50"
                >
                    {saving ? 'Salvando...' : 'Salvar Dados Cadastrais'}
                </button>
            </div>
        </form>
    );
}
