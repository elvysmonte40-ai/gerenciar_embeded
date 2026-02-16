import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export const SystemMessageList = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    window.location.href = "/login";
                    return;
                }

                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role, organization_id")
                    .eq("id", session.user.id)
                    .single();

                if (!profile || profile.role !== "admin") {
                    window.location.href = "/dashboard";
                    return;
                }

                const { data, error } = await supabase
                    .from("system_messages")
                    .select("*")
                    .eq("organization_id", profile.organization_id)
                    .order("created_at", { ascending: false });

                if (error) throw error;
                setMessages(data || []);
            } catch (err) {
                console.error("Error fetching messages:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);

    if (loading) return <div className="p-12 text-center text-gray-500">Carregando mensagens...</div>;

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
                {messages.length > 0 ? (
                    messages.map((message) => (
                        <li key={message.id}>
                            <a
                                href={`/admin/messages/${message.id}`}
                                className="block hover:bg-gray-50 transition-colors"
                            >
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-brand truncate">
                                            {message.title}
                                        </p>
                                        <div className="ml-2 shrink-0 flex">
                                            <p
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${message.status === "active"
                                                        ? "bg-green-100 text-green-800"
                                                        : message.status === "draft"
                                                            ? "bg-gray-100 text-gray-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {message.status === "active"
                                                    ? "Ativo"
                                                    : message.status === "draft"
                                                        ? "Rascunho"
                                                        : "Arquivado"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-text-secondary">
                                                <svg
                                                    className="shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                                </svg>
                                                {message.target_audience === "all"
                                                    ? "Todos"
                                                    : message.target_audience === "profile"
                                                        ? "Perfis Específicos"
                                                        : "Usuários Específicos"}
                                            </p>
                                            <p className="mt-2 flex items-center text-sm text-text-secondary sm:mt-0 sm:ml-6">
                                                <svg
                                                    className="shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 00-1-1H6zm1 2h6v1H7V4zM4 16h12V8H4v8zM4 6h12v2H4V6z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                {new Date(message.created_at).toLocaleDateString(
                                                    "pt-BR"
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </li>
                    ))
                ) : (
                    <li className="px-4 py-12 text-center">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-text-primary">
                            Nenhuma mensagem
                        </h3>
                        <p className="mt-1 text-sm text-text-secondary">
                            Comece criando uma nova mensagem para os usuários.
                        </p>
                        <div className="mt-6">
                            <a
                                href="/admin/messages/new"
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand"
                            >
                                Nova Mensagem
                            </a>
                        </div>
                    </li>
                )}
            </ul>
        </div>
    );
};
