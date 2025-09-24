import type { GraphData } from './types';

export const initialGraphData: GraphData = {
  nodes: [
    {
      id: 'n1',
      type: 'configurable',
      position: { x: 0, y: 0 },
      data: {
        label: 'Data Source',
        inputs: [],
        outputs: [
          { id: 'n1-out-1', label: 'Records' },
          { id: 'n1-out-2', label: 'Metadata' }
        ]
      }
    },
    {
      id: 'n2',
      type: 'configurable',
      position: { x: 0, y: 0 },
      data: {
        label: 'Transformation',
        inputs: [
          { id: 'n2-in-1', label: 'Input' },
          { id: 'n2-in-2', label: 'Config' }
        ],
        outputs: [{ id: 'n2-out-1', label: 'Output' }]
      }
    },
    {
      id: 'n3',
      type: 'configurable',
      position: { x: 0, y: 0 },
      data: {
        label: 'Analytics',
        inputs: [
          { id: 'n3-in-1', label: 'Dataset' }
        ],
        outputs: [
          { id: 'n3-out-1', label: 'Report' },
          { id: 'n3-out-2', label: 'Alerts' }
        ]
      }
    }
  ],
  edges: [
    {
      id: 'e1-2a',
      source: 'n1',
      target: 'n2',
      sourceHandle: 'n1-out-1',
      targetHandle: 'n2-in-1'
    },
    {
      id: 'e1-2b',
      source: 'n1',
      target: 'n2',
      sourceHandle: 'n1-out-2',
      targetHandle: 'n2-in-2'
    },
    {
      id: 'e2-3',
      source: 'n2',
      target: 'n3',
      sourceHandle: 'n2-out-1',
      targetHandle: 'n3-in-1'
    }
  ]
};

export async function loadGraphData(): Promise<GraphData> {
  // This is where remote loading can be implemented.
  // Example:
  // const response = await fetch('/api/graph.json');
  // if (!response.ok) throw new Error('Failed to load graph');
  // return (await response.json()) as GraphData;
  return JSON.parse(JSON.stringify(initialGraphData));
}
