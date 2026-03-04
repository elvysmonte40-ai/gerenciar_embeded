import React, { useState } from 'react';

export function HelpDeskWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState('bug');
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setError(null);

        try {
            const currentRoute = window.location.pathname;
            const userAgent = navigator.userAgent;

            // Call the support API endpoint
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    message,
                    route: currentRoute,
                    userAgent
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erro ao enviar feedback');
            }

            setSuccess(true);
            setTimeout(() => {
                setIsOpen(false);
                setSuccess(false);
                setMessage('');
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Widget Form (Popup) */}
            {isOpen && (
                <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-80 mb-4 overflow-hidden transform transition-all">
                    <div className="bg-brand text-white px-4 py-3 flex justify-between items-center">
                        <h3 className="font-semibold flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Suporte e Feedback
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </div>

                    <div className="p-4">
                        {success ? (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <h4 className="font-semibold text-gray-900">Mensagem Enviada!</h4>
                                <p className="text-sm text-gray-500 mt-1">Nossa equipe recebeu seu feedback. Muito obrigado.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Qual é o assunto?</label>
                                    <select
                                        className="w-full text-sm border-gray-300 rounded-md focus:ring-brand focus:border-brand"
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        required
                                    >
                                        <option value="bug">Reportar um Problema/Bug</option>
                                        <option value="feedback">Sugestão de Melhoria</option>
                                        <option value="help">Dúvida no Sistema</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Detalhes</label>
                                    <textarea
                                        rows={4}
                                        className="w-full text-sm border-gray-300 rounded-md focus:ring-brand focus:border-brand"
                                        placeholder={type === 'bug' ? "Descreva o que aconteceu de errado..." : "Escreva sua sugestão ou dúvida..."}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Sua página atual ({window.location.pathname}) será enviada em anexo.</p>
                                </div>

                                {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">{error}</div>}

                                <button
                                    type="submit"
                                    disabled={sending || !message.trim()}
                                    className="w-full bg-brand text-white font-medium py-2 px-4 rounded-md transition-colors hover:bg-brand-dark disabled:opacity-50 flex justify-center items-center"
                                >
                                    {sending ? 'Enviando...' : 'Enviar Feedback'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center shadow-lg transition-all duration-300 focus:outline-none ${isOpen
                        ? 'h-10 w-10 bg-gray-600 rounded-full text-white'
                        : 'h-14 w-14 bg-brand hover:bg-brand-dark rounded-full text-white ring-4 ring-brand/30'
                    }`}
                aria-label="Ajuda e Suporte"
                title="Ajuda e Suporte"
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-7 h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                )}
            </button>
        </div>
    );
}
