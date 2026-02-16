import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import type { SystemMessage } from "../types/system-messages";

export const NotificationBell: React.FC = () => {
    const [messages, setMessages] = useState<SystemMessage[]>([]);
    const [readMessageIds, setReadMessageIds] = useState<Set<string>>(new Set());
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchMessages = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Get user profile for filtering
        const { data: profile } = await supabase
            .from("profiles")
            .select("role, organization_id")
            .eq("id", session.user.id)
            .single();

        if (!profile) return;

        // Fetch active messages
        const now = new Date().toISOString();
        const { data: allMessages, error } = await supabase
            .from("system_messages")
            .select("*")
            .eq("status", "active")
            .eq("organization_id", profile.organization_id) // Ensure org filter
            .or(`start_date.is.null,start_date.lte.${now}`)
            .or(`end_date.is.null,end_date.gte.${now}`)
            .order('created_at', { ascending: false });

        if (error || !allMessages) return;

        // Filter by Target Audience (Same logic as Manager)
        const relevantMessages = allMessages.filter((msg) => {
            if (msg.target_audience === "all") return true;

            const targetIds = Array.isArray(msg.target_ids) ? msg.target_ids : [];
            if (msg.target_audience === "profile") {
                return targetIds.includes(profile.role);
            }
            if (msg.target_audience === "user") {
                return targetIds.includes(session.user.id);
            }
            return false;
        });

        // Check filtering by read/unread for badge
        const { data: reads } = await supabase
            .from("system_message_reads")
            .select("message_id")
            .eq("user_id", session.user.id);



        const readIds = new Set(reads?.map(r => r.message_id));
        setReadMessageIds(readIds);

        setMessages(relevantMessages);
        setUnreadCount(relevantMessages.filter(m => !readIds.has(m.id)).length);
    };

    useEffect(() => {
        fetchMessages();

        // Listen for new messages or reads
        const channel = supabase
            .channel('public:system_messages_bell')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'system_messages' }, () => {
                fetchMessages();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'system_message_reads' }, () => {
                fetchMessages();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        }
    }, []);

    const handleMessageClick = (msg: SystemMessage) => {
        setIsOpen(false);
        window.dispatchEvent(
            new CustomEvent('open-system-message', {
                detail: { message: msg }
            })
        );
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-500 hover:text-brand hover:bg-gray-50 rounded-full focus:outline-none transition-colors relative"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in duration-200">
                    <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                        <h3 className="text-sm font-semibold text-text-primary">Notificações</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {messages.length > 0 ? (
                            messages.map(msg => (
                                <button
                                    key={msg.id}
                                    onClick={() => handleMessageClick(msg)}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                                >
                                    <p className="text-sm font-medium text-text-primary truncate">{msg.title}</p>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-xs text-text-secondary">
                                            {new Date(msg.created_at).toLocaleDateString('pt-BR')}
                                        </p>
                                        {readMessageIds.has(msg.id) ? (
                                            <span className="text-xs text-gray-400 font-medium">Lida</span>
                                        ) : (
                                            <span className="text-xs text-brand font-medium">Ver</span>
                                        )}
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-center text-sm text-text-tertiary">
                                Nenhuma notificação
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
