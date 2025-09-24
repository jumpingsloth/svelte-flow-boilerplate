import dagre from '@dagrejs/dagre';
import type { FlowEdge, FlowNode } from './types';

const NODE_MIN_WIDTH = 320;
const NODE_MIN_HEIGHT = 160;
const CHARACTER_PIXEL_APPROX = 8;
const NODE_TEXT_PADDING = 200;
const PORT_ROW_HEIGHT = 44;

function estimateNodeDimensions(node: FlowNode) {
  const labels = [
    node?.data?.label ?? '',
    ...(node?.data?.inputs ?? []).map((port) => port.label ?? ''),
    ...(node?.data?.outputs ?? []).map((port) => port.label ?? '')
  ];
  const longestLabelLength = labels.reduce((max, label) => Math.max(max, label.length), 0);
  const estimatedWidth = longestLabelLength * CHARACTER_PIXEL_APPROX + NODE_TEXT_PADDING;
  const width = Math.max(NODE_MIN_WIDTH, node.width ?? 0, estimatedWidth);

  const portsPerColumn = Math.max(node?.data?.inputs?.length ?? 0, node?.data?.outputs?.length ?? 0);
  const estimatedHeight = NODE_MIN_HEIGHT + portsPerColumn * PORT_ROW_HEIGHT;
  const height = Math.max(NODE_MIN_HEIGHT, node.height ?? 0, estimatedHeight);

  return { width, height };
}

export function applyAutoLayout(nodes: FlowNode[], edges: FlowEdge[]): FlowNode[] {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'LR', nodesep: 120, ranksep: 160, marginx: 64, marginy: 64 });
  g.setDefaultEdgeLabel(() => ({}));

  const nodeDimensions = new Map<string, { width: number; height: number }>();

  for (const node of nodes) {
    const dimensions = estimateNodeDimensions(node);
    nodeDimensions.set(node.id, dimensions);
    g.setNode(node.id, dimensions);
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

    const dimensions = nodeDimensions.get(node.id) ?? { width: NODE_MIN_WIDTH, height: NODE_MIN_HEIGHT };

    return {
      ...node,
      position: {
        x: dagreNode.x - dimensions.width / 2,
        y: dagreNode.y - dimensions.height / 2
      },
      width: dimensions.width,
      height: dimensions.height
    };
  });
}
