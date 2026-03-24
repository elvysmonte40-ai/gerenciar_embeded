import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../../lib/supabase';
import ReactFlow, {
    Controls,
    Background,
    MiniMap,
    Handle,
    Position,
    ReactFlowProvider
} from 'reactflow';
import type { Edge, Node as ReactFlowNode } from 'reactflow';
import 'reactflow/dist/style.css';

interface UserNode {
    id: string;
    full_name: string;
    job_title: string;
    department: string;
    manager_id: string | null;
    avatar_url?: string;
    children?: UserNode[];
}

const OrganogramNode = ({ data }: any) => {
    return (
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 w-48 text-center cursor-default hover:shadow-md transition-shadow relative">
            <Handle type="target" position={Position.Top} className="opacity-0" />
            <div className="flex flex-col items-center">
                <div className="h-10 w-10 mb-2 rounded-full bg-brand-light text-brand flex items-center justify-center font-bold text-sm shrink-0">
                    {data.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="w-full overflow-hidden">
                    <h4 className="text-sm font-semibold text-gray-900 truncate w-full" title={data.full_name}>{data.full_name}</h4>
                    <p className="text-xs text-gray-500 truncate w-full mt-0.5" title={data.job_title}>{data.job_title || 'Sem cargo'}</p>
                    {data.department && (
                        <p className="text-[10px] text-gray-400 truncate w-full mt-0.5" title={data.department}>{data.department}</p>
                    )}
                </div>
            </div>
            <Handle type="source" position={Position.Bottom} className="opacity-0" />
        </div>
    );
};

const nodeTypes = {
    orgNode: OrganogramNode,
};

function buildReactFlowData(roots: UserNode[]) {
    const nodes: ReactFlowNode[] = [];
    const edges: Edge[] = [];
    const layoutInfo = new Map<string, { width: number }>();

    const NODE_WIDTH = 200; // Expected node width
    const GAP_X = 40; // Horizontal gap between siblings
    const GAP_Y = 160; // Vertical gap between layers

    // 1. Calculate subtree widths for everything
    const calculateSubtreeWidth = (node: UserNode) => {
        if (!node.children || node.children.length === 0) {
            layoutInfo.set(node.id, { width: NODE_WIDTH });
            return NODE_WIDTH;
        }

        let childrenWidth = 0;
        node.children.forEach(child => {
            childrenWidth += calculateSubtreeWidth(child);
        });

        const totalWidth = childrenWidth + (node.children.length - 1) * GAP_X;
        layoutInfo.set(node.id, { width: Math.max(NODE_WIDTH, totalWidth) });
        return Math.max(NODE_WIDTH, totalWidth);
    };

    // 2. Assign positions based on subtree widths
    let currentRootX = 0;

    const assignPositions = (node: UserNode, xStart: number, y: number) => {
        const info = layoutInfo.get(node.id);
        const centerOffset = (info?.width || NODE_WIDTH) / 2;
        const nodeX = xStart + centerOffset - (NODE_WIDTH / 2);

        nodes.push({
            id: node.id,
            type: 'orgNode',
            position: { x: nodeX, y: y },
            data: {
                full_name: node.full_name,
                job_title: node.job_title,
                department: node.department,
                color: '#ffffff' // For minimap
            }
        });

        if (node.children && node.children.length > 0) {
            let currentX = xStart;
            node.children.forEach(child => {
                const childInfo = layoutInfo.get(child.id);

                edges.push({
                    id: `e-${node.id}-${child.id}`,
                    source: node.id,
                    target: child.id,
                    type: 'smoothstep',
                    animated: false,
                    style: { stroke: '#cbd5e1', strokeWidth: 2 }
                });

                assignPositions(child, currentX, y + GAP_Y);
                currentX += (childInfo?.width || NODE_WIDTH) + GAP_X;
            });
        }
    };

    roots.forEach(root => {
        const rootWidth = calculateSubtreeWidth(root);
        assignPositions(root, currentRootX, 0);
        currentRootX += rootWidth + GAP_X * 2; // Separate multiple roots
    });

    return { nodes, edges };
}

export default function Organogram() {
    return (
        <ReactFlowProvider>
            <OrganogramInner />
        </ReactFlowProvider>
    );
}

function OrganogramInner() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters state
    const [filterJobTitle, setFilterJobTitle] = useState("");
    const [filterDepartment, setFilterDepartment] = useState("");
    const [filterManager, setFilterManager] = useState("");

    // Lookups for filters
    const [rolesList, setRolesList] = useState<any[]>([]);
    const [deptsList, setDeptsList] = useState<any[]>([]);
    const [managersList, setManagersList] = useState<any[]>([]);

    const [flowNodes, setFlowNodes] = useState<ReactFlowNode[]>([]);
    const [flowEdges, setFlowEdges] = useState<Edge[]>([]);

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const orgId = session.user.user_metadata.organization_id;
                if (orgId) {
                    await loadLookups(orgId);
                }
            }
            fetchData();
        };
        init();
    }, []);

    useEffect(() => {
        // Fetch when filters change
        fetchData();
    }, [filterJobTitle, filterDepartment, filterManager]);

    const loadLookups = async (orgId: string) => {
        const [{ data: rData }, { data: dData }, { data: mData }] = await Promise.all([
            supabase.from('job_titles').select('id, title').eq('organization_id', orgId),
            supabase.from('departments').select('id, name').eq('organization_id', orgId),
            supabase.from('profiles').select('manager_name').eq('organization_id', orgId).not('manager_name', 'is', null)
        ]);
        if (rData) setRolesList(rData);
        if (dData) setDeptsList(dData);
        if (mData) {
            const uniqueManagers = Array.from(new Set(mData.map(m => m.manager_name))).filter(Boolean);
            setManagersList(uniqueManagers.map(name => ({ name })));
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const orgId = session.user.user_metadata.organization_id;
            if (!orgId) return;

            let query = supabase
                .from('profiles')
                .select(`
                    id, 
                    full_name, 
                    manager_id,
                    manager_name,
                    job_title_id,
                    department_id,
                    job_titles:job_title_id (title),
                    departments:department_id (name)
                `)
                .eq('organization_id', orgId);

            if (filterJobTitle) {
                query = query.eq('job_title_id', filterJobTitle);
            }
            if (filterDepartment) {
                query = query.eq('department_id', filterDepartment);
            }
            if (filterManager) {
                query = query.eq('manager_name', filterManager);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Map data to flattened structure
            const formattedData = (data || []).map((u: any) => ({
                id: u.id,
                full_name: u.full_name,
                manager_id: u.manager_id,
                job_title: (Array.isArray(u.job_titles) ? u.job_titles[0]?.title : u.job_titles?.title) || 'Sem cargo',
                department: (Array.isArray(u.departments) ? u.departments[0]?.name : u.departments?.name) || ''
            }));

            const builtTree = buildTree(formattedData);
            const { nodes, edges } = buildReactFlowData(builtTree);
            setFlowNodes(nodes);
            setFlowEdges(edges);

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

            // Se tem manager e o manager está no resultado (pode não estar filtrado)
            if (u.manager_id && userMap.has(u.manager_id)) {
                const manager = userMap.get(u.manager_id);
                manager?.children?.push(node);
            } else {
                roots.push(node);
            }
        });

        return roots;
    };

    return (
        <div className="space-y-4 h-full flex flex-col w-full relative">
            {/* BARRA DE FILTROS E CONTROLES */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between shrink-0 mb-4 z-10 mx-6 mt-6">
                <div className="flex flex-wrap gap-4 flex-1">
                    {/* Job Title Busca */}
                    <div className="min-w-[150px]">
                        <select
                            className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand"
                            value={filterJobTitle}
                            onChange={(e) => setFilterJobTitle(e.target.value)}
                        >
                            <option value="">Cargo: Todos</option>
                            {rolesList.map((r, i) => (
                                <option key={i} value={r.id}>{r.title}</option>
                            ))}
                        </select>
                    </div>
                    {/* Dept Busca */}
                    <div className="min-w-[150px]">
                        <select
                            className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand"
                            value={filterDepartment}
                            onChange={(e) => setFilterDepartment(e.target.value)}
                        >
                            <option value="">Departamento: Todos</option>
                            {deptsList.map((d, i) => (
                                <option key={i} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                    {/* Manager Busca */}
                    <div className="min-w-[150px]">
                        <select
                            className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand"
                            value={filterManager}
                            onChange={(e) => setFilterManager(e.target.value)}
                        >
                            <option value="">Líder/Gestor: Todos</option>
                            {managersList.map((m, i) => (
                                <option key={i} value={m.name}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mx-6 rounded-md text-sm shrink-0 z-10">
                    {error}
                </div>
            )}

            <div className="flex-1 w-full relative z-0">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mr-3"></div>
                        Carregando organograma...
                    </div>
                ) : flowNodes.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Nenhum dado encontrado para gerar o organograma.
                    </div>
                ) : (
                    <ReactFlow
                        nodes={flowNodes}
                        edges={flowEdges}
                        nodeTypes={nodeTypes}
                        fitView
                        attributionPosition="bottom-left"
                        nodesDraggable={false}
                        nodesConnectable={false}
                        elementsSelectable={true}
                    >
                        <Background color="#aaa" gap={16} />
                        <Controls />
                        <MiniMap
                            nodeStrokeColor="#64748b"
                            nodeColor={(n: any) => n.data?.color || '#fff'}
                            nodeBorderRadius={2}
                        />
                    </ReactFlow>
                )}
            </div>
        </div>
    );
}
