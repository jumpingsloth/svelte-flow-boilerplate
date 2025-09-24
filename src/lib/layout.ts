import dagre from '@dagrejs/dagre';
import type { FlowEdge, FlowNode } from './types';

const NODE_DEFAULT_WIDTH = 220;
const NODE_DEFAULT_HEIGHT = 120;

export function applyAutoLayout(nodes: FlowNode[], edges: FlowEdge[]): FlowNode[] {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 80 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_DEFAULT_WIDTH, height: NODE_DEFAULT_HEIGHT });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const dagreNode = g.node(node.id);

    if (!dagreNode) {
      return node;
    }

    return {
      ...node,
      position: {
        x: dagreNode.x - NODE_DEFAULT_WIDTH / 2,
        y: dagreNode.y - NODE_DEFAULT_HEIGHT / 2
      }
    };
  });
}
