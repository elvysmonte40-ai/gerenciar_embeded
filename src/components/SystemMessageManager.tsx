import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { SystemMessage } from "../types/system-messages";
import DOMPurify from 'isomorphic-dompurify';

export const SystemMessageManager: React.FC = () => {
    const [messages, setMessages] = useState<SystemMessage[]>([]);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const isAuthPage = ["/login", "/register", "/forgot-password", "/update-password"].includes(
            window.location.pathname
        );
        if (!isAuthPage) {
            checkMessages();
        }
    }, []);

    const checkMessages = async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;
        setUserId(session.user.id);

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
            .eq("organization_id", profile.organization_id)
            .or(`start_date.is.null,start_date.lte.${now}`)
            .or(`end_date.is.null,end_date.gte.${now}`);

        if (error || !allMessages) return;

        // Filter by Reads
        const { data: reads } = await supabase
            .from("system_message_reads")
            .select("message_id")
            .eq("user_id", session.user.id);

        const readIds = new Set(reads?.map((r) => r.message_id));

        // Filter by Target Audience AND Not Read
        const relevantMessages = allMessages.filter((msg) => {
            if (readIds.has(msg.id)) return false;

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

        if (relevantMessages.length > 0) {
            setMessages(relevantMessages);
            setIsOpen(true);
        }
    };

    const handleClose = async (markRead: boolean) => {
        if (!userId || messages.length === 0) return;

        const currentMsg = messages[currentMessageIndex];

        if (markRead) {
            await supabase.from("system_message_reads").insert({
                message_id: currentMsg.id,
                user_id: userId,
            });
        }

        // Move to next message or close
        if (currentMessageIndex < messages.length - 1) {
            setCurrentMessageIndex(currentMessageIndex + 1);
        } else {
            setIsOpen(false);
        }
    };

    // Custom Event listener to open specific message from bell
    useEffect(() => {
        const handleOpenMessage = (e: CustomEvent) => {
            const msg = e.detail.message;
            if (msg) {
                setMessages([msg]);
                setCurrentMessageIndex(0);
                setIsOpen(true);
            }
        };

        window.addEventListener('open-system-message', handleOpenMessage as EventListener);
        return () => window.removeEventListener('open-system-message', handleOpenMessage as EventListener);
    }, []);

    if (!isOpen || messages.length === 0) return null;

    const message = messages[currentMessageIndex];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-semibold text-text-primary">
                        {message.title}
                    </h3>
                    <button
                        onClick={() => handleClose(false)} // Just close without marking read? Logic says "Marcar como lido" to dismiss.
                        // If user clicks X, maybe we don't mark as read? Or we do?
                        // "Marcar como lido" is explicit requirement.
                        // Let's say X closes but doesn't mark read (will appear next time).
                        className="text-text-secondary hover:text-text-primary focus:outline-none"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 prose prose-sm max-w-none text-text-primary">
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message.content) }} />
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                    <span className="text-xs text-text-secondary">
                        {currentMessageIndex + 1} de {messages.length}
                    </span>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleClose(false)}
                            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary font-medium"
                        >
                            Ler depois
                        </button>
                        <button
                            onClick={() => handleClose(true)}
                            className="px-4 py-2 bg-brand text-white text-sm font-medium rounded-md hover:bg-brand-dark shadow-sm transition-colors"
                        >
                            Marcar como lido
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
