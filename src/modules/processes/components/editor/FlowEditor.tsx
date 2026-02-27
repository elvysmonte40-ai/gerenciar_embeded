import React, { useCallback, useState, useEffect, useRef } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    MiniMap,
    Handle,
    Position,
    useReactFlow
} from 'reactflow';
import type { Connection, Edge, Node, ReactFlowInstance, NodeProps } from 'reactflow';
import 'reactflow/dist/style.css';
import {
    PlayCircle,
    Square,
    StopCircle,
    Settings,
    FileText,
    CheckCircle,
    AlertTriangle,
    Database,
    Mail,
    User,
    Diamond,
    Circle,
    ArrowRight
} from 'lucide-react';

interface FlowEditorProps {
    initialFlowData?: any;
    onFlowChange: (flowData: any) => void;
    readOnly?: boolean;
    availablePools?: string[];
}

// Map of available icons for nodes
const iconMap: Record<string, React.ElementType> = {
    'play': PlayCircle,
    'square': Square,
    'stop': StopCircle,
    'file': FileText,
    'check': CheckCircle,
    'alert': AlertTriangle,
    'database': Database,
    'mail': Mail,
    'user': User,
    'diamond': Diamond,
    'circle': Circle,
    'arrow': ArrowRight
};

// Initial nodes if none provided
const initialNodes: Node[] = [
    {
        id: '1',
        position: { x: 250, y: 50 },
        data: { label: 'Início', icon: 'play', color: '#eff6ff', shape: 'rounded' },
        type: 'custom'
    },
];

// -- COMPONENTS --

// Inline Text Editor
const EditableLabel = ({ id, label, readOnly }: { id: string, label: string, readOnly?: boolean }) => {
    const { setNodes } = useReactFlow();
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(label);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setValue(label);
    }, [label]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const onCommit = () => {
        setIsEditing(false);
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, label: value } };
                }
                return node;
            })
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onCommit();
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={onCommit}
                onKeyDown={handleKeyDown}
                className="text-xs font-medium text-center bg-white/80 border border-blue-400 rounded px-1 outline-none w-full min-w-[80px]"
            />
        );
    }

    return (
        <span
            onDoubleClick={() => !readOnly && setIsEditing(true)}
            className={`w-full text-center block px-2 truncate ${readOnly ? '' : 'cursor-text'}`}
            title={readOnly ? label : "Clique duas vezes para editar"}
        >
            {label}
        </span>
    );
};

// Advanced Custom Node with 4 handles and styling
const CustomNode = ({ id, data, selected }: NodeProps) => {
    const Icon = data.icon && iconMap[data.icon] ? iconMap[data.icon] : null;

    // Shape styles
    let shapeClass = 'rounded-md';
    if (data.shape === 'circle') shapeClass = 'rounded-full aspect-square flex justify-center items-center p-4';
    if (data.shape === 'diamond') shapeClass = 'rotate-45 aspect-square flex justify-center items-center p-4';

    // For diamond, we need to counter-rotate content so it stays straight
    const contentRotation = data.shape === 'diamond' ? '-rotate-45' : '';

    return (
        <div
            className={`shadow-md border min-w-[120px] min-h-[50px] text-sm font-medium flex flex-col justify-center items-center transition-all relative ${shapeClass} ${selected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-300'}`}
            style={{ backgroundColor: data.color || '#ffffff' }}
        >
            {/* Handles - All 4 sides with adjusted positioning */}
            <Handle type="target" position={Position.Top} className="w-3! h-3! bg-gray-400! hover:bg-blue-500! transition-colors" />
            <Handle type="source" position={Position.Right} className="w-3! h-3! bg-gray-400! hover:bg-blue-500! transition-colors" />
            <Handle type="source" position={Position.Bottom} className="w-3! h-3! bg-gray-400! hover:bg-blue-500! transition-colors" />
            <Handle type="target" position={Position.Left} className="w-3! h-3! bg-gray-400! hover:bg-blue-500! transition-colors" />

            {/* Content */}
            <div className={`flex flex-col items-center gap-1 ${contentRotation} ${data.shape === 'circle' ? 'p-1' : 'px-4 py-2'}`}>
                {data.pool && (
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5 bg-gray-100/80 px-1.5 py-0.5 rounded">
                        {data.pool}
                    </span>
                )}
                {Icon && <Icon className="w-5 h-5 opacity-70 mb-1" />}
                <EditableLabel id={id} label={data.label} readOnly={data.readOnly} />
            </div>
        </div>
    );
};

const nodeTypes = {
    custom: CustomNode,
};

// Property Inspector for Selected Node
const NodeInspector = ({ selectedNode, readOnly, availablePools = [] }: { selectedNode: Node, readOnly?: boolean, availablePools?: string[] }) => {
    const { setNodes } = useReactFlow();

    const updateNodeData = (key: string, value: any) => {
        if (readOnly) return;
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === selectedNode.id) {
                    return { ...node, data: { ...node.data, [key]: value } };
                }
                return node;
            })
        );
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="p-4 border-b border-gray-200 bg-white">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Propriedades {readOnly && '(Leitura)'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                    {readOnly ? 'Visualizando:' : 'Editando:'} {selectedNode.data.label}
                </p>
            </div>

            <div className={`p-4 space-y-6 overflow-y-auto flex-1 ${readOnly ? 'pointer-events-none opacity-70' : ''}`}>
                {/* Pool (Piscina) Selection */}
                {availablePools.length > 0 && (
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Piscina (Setor)</label>
                        <select
                            value={selectedNode.data.pool || ''}
                            onChange={(e) => updateNodeData('pool', e.target.value)}
                            className="w-full border border-gray-300 rounded p-1.5 text-sm outline-none focus:border-blue-400 bg-white"
                        >
                            <option value="">Sem piscina</option>
                            {availablePools.map(pool => (
                                <option key={pool} value={pool}>{pool}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Shapes */}
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Formato</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => updateNodeData('shape', 'rounded')}
                            className={`p-2 border rounded hover:bg-gray-100 ${selectedNode.data.shape !== 'circle' && selectedNode.data.shape !== 'diamond' ? 'bg-blue-50 border-blue-400' : 'bg-white'}`}
                            title="Desfazer/Retangular"
                        >
                            <Square className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                            onClick={() => updateNodeData('shape', 'circle')}
                            className={`p-2 border rounded hover:bg-gray-100 ${selectedNode.data.shape === 'circle' ? 'bg-blue-50 border-blue-400' : 'bg-white'}`}
                            title="Circular"
                        >
                            <Circle className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                            onClick={() => updateNodeData('shape', 'diamond')}
                            className={`p-2 border rounded hover:bg-gray-100 ${selectedNode.data.shape === 'diamond' ? 'bg-blue-50 border-blue-400' : 'bg-white'}`}
                            title="Diamante (Decisão)"
                        >
                            <Diamond className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Colors */}
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Cor</label>
                    <div className="grid grid-cols-5 gap-2">
                        {['#ffffff', '#eff6ff', '#f0fdf4', '#fef2f2', '#fffbeb', '#f3e8ff', '#fafafa', '#fee2e2', '#dbeafe', '#d1fae5'].map(color => (
                            <button
                                key={color}
                                onClick={() => updateNodeData('color', color)}
                                className={`w-8 h-8 rounded-full border shadow-sm ${selectedNode.data.color === color ? 'ring-2 ring-blue-500 ring-offset-2' : 'border-gray-200'}`}
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 cursor-pointer">
                            <input
                                type="color"
                                className="opacity-0 w-full h-full absolute top-0 left-0 cursor-pointer"
                                value={selectedNode.data.color || '#ffffff'}
                                onChange={(e) => updateNodeData('color', e.target.value)}
                            />
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 pointer-events-none">
                                <span className="text-xs">+</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Icons */}
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Ícone</label>
                    <div className="grid grid-cols-4 gap-2">
                        {Object.keys(iconMap).map((iconKey) => {
                            const IconComp = iconMap[iconKey];
                            return (
                                <button
                                    key={iconKey}
                                    onClick={() => updateNodeData('icon', iconKey)}
                                    className={`p-2 border rounded flex justify-center items-center hover:bg-gray-100 ${selectedNode.data.icon === iconKey ? 'bg-blue-50 border-blue-400 text-blue-600' : 'bg-white text-gray-600'}`}
                                    title={iconKey}
                                >
                                    <IconComp className="w-5 h-5" />
                                </button>
                            );
                        })}
                        <button
                            onClick={() => updateNodeData('icon', null)}
                            className={`p-2 border rounded flex justify-center items-center hover:bg-gray-100 text-xs font-medium ${!selectedNode.data.icon ? 'bg-blue-50 border-blue-400' : 'bg-white text-gray-500'}`}
                        >
                            Sem
                        </button>
                    </div>
                </div>
            </div>

            {!readOnly && (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <button
                        onClick={() => setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id))}
                        className="w-full py-2 px-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium transition-colors border border-red-200"
                    >
                        Excluir Elemento
                    </button>
                </div>
            )}
        </div>
    );
};

// Sidebar for Drag and Drop
const ToolsSidebar = () => {
    const onDragStart = (event: React.DragEvent, label: string, data: any) => {
        event.dataTransfer.setData('application/reactflow', 'custom');
        event.dataTransfer.setData('application/reactflow-label', label);
        event.dataTransfer.setData('application/reactflow-data', JSON.stringify(data));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Ferramentas</h3>
                <p className="text-xs text-gray-500 mt-1">Arraste os elementos para o fluxo</p>
            </div>

            <div className="p-4 flex flex-col gap-3 overflow-y-auto flex-1">
                <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Básicos</p>

                    <div
                        className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-grab hover:bg-blue-100 transition-colors flex items-center gap-3"
                        onDragStart={(event) => onDragStart(event, 'Início', { icon: 'play', color: '#eff6ff', shape: 'rounded' })}
                        draggable
                    >
                        <PlayCircle className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Início</span>
                    </div>

                    <div
                        className="p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:bg-gray-50 transition-colors flex items-center gap-3"
                        onDragStart={(event) => onDragStart(event, 'Etapa', { icon: 'square', color: '#ffffff', shape: 'rounded' })}
                        draggable
                    >
                        <Square className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Etapa</span>
                    </div>

                    <div
                        className="p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:bg-gray-50 transition-colors flex items-center gap-3"
                        onDragStart={(event) => onDragStart(event, 'Decisão', { icon: 'diamond', color: '#ffffff', shape: 'diamond' })}
                        draggable
                    >
                        <Diamond className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Decisão</span>
                    </div>

                    <div
                        className="p-3 bg-red-50 border border-red-200 rounded-lg cursor-grab hover:bg-red-100 transition-colors flex items-center gap-3"
                        onDragStart={(event) => onDragStart(event, 'Fim', { icon: 'stop', color: '#fef2f2', shape: 'rounded' })}
                        draggable
                    >
                        <StopCircle className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-red-900">Fim</span>
                    </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Avançados</p>
                    <div
                        className="p-3 bg-purple-50 border border-purple-200 rounded-lg cursor-grab hover:bg-purple-100 transition-colors flex items-center gap-3"
                        onDragStart={(event) => onDragStart(event, 'E-mail', { icon: 'mail', color: '#f3e8ff', shape: 'rounded' })}
                        draggable
                    >
                        <Mail className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">E-mail</span>
                    </div>

                    <div
                        className="p-3 bg-green-50 border border-green-200 rounded-lg cursor-grab hover:bg-green-100 transition-colors flex items-center gap-3"
                        onDragStart={(event) => onDragStart(event, 'Aprovação', { icon: 'check', color: '#f0fdf4', shape: 'circle' })}
                        draggable
                    >
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Aprovação</span>
                    </div>

                    <div
                        className="p-3 bg-orange-50 border border-orange-200 rounded-lg cursor-grab hover:bg-orange-100 transition-colors flex items-center gap-3"
                        onDragStart={(event) => onDragStart(event, 'Alerta', { icon: 'alert', color: '#fff7ed', shape: 'rounded' })}
                        draggable
                    >
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <span className="text-sm font-medium text-orange-900">Alerta</span>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                <p className="mb-1">Clique em um elemento para editar suas propriedades.</p>
            </div>
        </div>
    );
};

// Refactored Inner Component to hold all state
const EditorContent = ({ initialFlowData, onFlowChange, readOnly, availablePools }: FlowEditorProps) => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(
        (initialFlowData?.nodes || initialNodes).map((n: any) => ({
            ...n,
            data: { ...n.data, readOnly } // Pass readOnly to node data for CustomNode
        }))
    );
    // When readOnly changes, update all nodes data
    useEffect(() => {
        setNodes((nds) => nds.map(n => ({ ...n, data: { ...n.data, readOnly } })));
    }, [readOnly, setNodes]);

    const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlowData?.edges || []);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    useEffect(() => {
        if (onFlowChange) {
            onFlowChange({ nodes, edges });
        }
    }, [nodes, edges, onFlowChange]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            if (!reactFlowInstance) return;

            const type = event.dataTransfer.getData('application/reactflow');
            const label = event.dataTransfer.getData('application/reactflow-label');
            const dataStr = event.dataTransfer.getData('application/reactflow-data');

            if (typeof type === 'undefined' || !type) return;

            let extraData = {};
            try {
                extraData = JSON.parse(dataStr);
            } catch (e) { }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: Math.random().toString(36).substr(2, 9),
                type,
                position,
                data: { label, ...extraData },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes]
    );

    const selectedNodeObject = nodes.find((n) => n.selected);

    return (
        <div className="flex h-full w-full">
            <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm z-10 transition-all shrink-0">
                {selectedNodeObject ? (
                    <NodeInspector selectedNode={selectedNodeObject} readOnly={readOnly} availablePools={availablePools} />
                ) : (
                    readOnly ? (
                        <div className="flex flex-col h-full items-center justify-center p-6 text-center text-gray-500">
                            <p>Modo de visualização.</p>
                            <p className="text-xs mt-2">Selecione um elemento para ver detalhes.</p>
                        </div>
                    ) : (
                        <ToolsSidebar />
                    )
                )}
            </aside>

            <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={readOnly ? undefined : onConnect}
                    onInit={setReactFlowInstance}
                    onDrop={readOnly ? undefined : onDrop}
                    onDragOver={readOnly ? undefined : onDragOver}
                    nodeTypes={nodeTypes}
                    fitView
                    attributionPosition="bottom-left"
                    deleteKeyCode={readOnly ? null : ['Backspace', 'Delete']}
                    nodesDraggable={!readOnly}
                    nodesConnectable={!readOnly}
                    elementsSelectable={true}
                >
                    <Background color="#aaa" gap={16} />
                    <Controls />
                    <MiniMap
                        nodeStrokeColor={(n) => {
                            if (n.style?.background) return n.style.background as string;
                            return '#64748b';
                        }}
                        nodeColor={(n) => {
                            return (n.data?.color as string) || '#fff';
                        }}
                        nodeBorderRadius={2}
                    />
                </ReactFlow>
            </div>
        </div>
    );
};

export const FlowEditor: React.FC<FlowEditorProps> = (props) => {
    return (
        <ReactFlowProvider>
            <EditorContent {...props} />
        </ReactFlowProvider>
    );
};
