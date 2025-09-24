import type { Edge, Node, XYPosition } from '@xyflow/svelte';

export type PortDirection = 'input' | 'output';

export interface Port {
  id: string;
  label: string;
}

export interface NodeData extends Record<string, unknown> {
  label: string;
  inputs: Port[];
  outputs: Port[];
}

export type FlowNode = Node<NodeData> & { position: XYPosition };
export type FlowEdge = Edge;

export interface GraphData {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface RenameHandleDetail {
  nodeId: string;
  handleId: string;
  portType: PortDirection;
  label: string;
}
