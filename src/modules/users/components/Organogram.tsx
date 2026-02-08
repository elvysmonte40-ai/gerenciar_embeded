import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface UserNode {
    id: string;
    full_name: string;
    job_title: string;
    manager_id: string | null;
    avatar_url?: string;
    children?: UserNode[];
}

export default function Organogram() {
    const [tree, setTree] = useState<UserNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const orgId = session.user.user_metadata.organization_id;
            if (!orgId) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, job_title, manager_id')
                .eq('organization_id', orgId);

            if (error) throw error;

            const builtTree = buildTree(data || []);
            setTree(builtTree);

        } catch (err: any) {
            console.error("Error fetching organogram data:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const buildTree = (users: any[]): UserNode[] => {
        const userMap = new Map<string, UserNode>();
        const roots: UserNode[] = [];

        // 1. Initialize all nodes
        users.forEach(u => {
            userMap.set(u.id, { ...u, children: [] });
        });

        // 2. Build hierarchy
        users.forEach(u => {
            const node = userMap.get(u.id);
            if (!node) return;

            if (u.manager_id && userMap.has(u.manager_id)) {
                const manager = userMap.get(u.manager_id);
                manager?.children?.push(node);
            } else {
                roots.push(node);
            }
        });

        return roots;
    };

    const renderNode = (node: UserNode) => {
        return (
            <li key={node.id} className="relative pl-8 mb-4">
                {/* Connector Lines */}
                <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-b-2 border-gray-200 rounded-bl-lg -translate-y-4"></div>

                {/* Node Card */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 w-64 transition-shadow hover:shadow-md">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-brand-light text-brand flex items-center justify-center font-bold text-sm shrink-0">
                            {node.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="text-sm font-semibold text-gray-900 truncate" title={node.full_name}>{node.full_name}</h4>
                            <p className="text-xs text-gray-500 truncate" title={node.job_title}>{node.job_title || 'Sem cargo'}</p>
                        </div>
                    </div>
                </div>

                {/* Children */}
                {node.children && node.children.length > 0 && (
                    <ul className="mt-4 border-l-2 border-gray-200 ml-4 pl-4 pt-2">
                        {node.children.map(child => (
                            <div key={child.id} className="relative">
                                {/* Vertical line fix for list items */}
                                {renderNode(child)}
                            </div>
                        ))}
                    </ul>
                )}
            </li>
        );
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Carregando organograma...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Erro: {error}</div>;

    return (
        <div className="p-6 overflow-auto bg-gray-50 rounded-xl border border-gray-100 min-h-[500px]">
            {tree.length === 0 ? (
                <div className="text-center text-gray-500">Nenhum dado encontrado para gerar o organograma.</div>
            ) : (
                <ul className="list-none pl-0">
                    {tree.map(rootNode => (
                        <div key={rootNode.id} className="mb-8">
                            {/* Root Node styling is slightly different, no top connectors */}
                            <div className="bg-white p-4 rounded-lg shadow-md border border-brand-light w-64 mx-auto md:mx-0 mb-4 ring-2 ring-brand ring-opacity-10">
                                <div className="flex items-center space-x-3">
                                    <div className="h-12 w-12 rounded-full bg-brand text-white flex items-center justify-center font-bold text-lg shrink-0">
                                        {rootNode.full_name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="text-base font-bold text-gray-900 truncate">{rootNode.full_name}</h4>
                                        <p className="text-sm text-gray-500 truncate">{rootNode.job_title || 'CEO / Diretor'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Children of Root */}
                            {rootNode.children && rootNode.children.length > 0 && (
                                <ul className="ml-8 border-l-2 border-gray-200 pl-4">
                                    {rootNode.children.map(child => renderNode(child))}
                                </ul>
                            )}
                        </div>
                    ))}
                </ul>
            )}
        </div>
    );
}
