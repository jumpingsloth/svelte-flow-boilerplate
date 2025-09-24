<script lang="ts">
  import '@xyflow/svelte/dist/style.css';
  import { get, writable } from 'svelte/store';
  import { onMount, setContext } from 'svelte';
  import {
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    SvelteFlow
  } from '@xyflow/svelte';
  import { addEdge, type Connection } from '@xyflow/system';
  import ConfigurableNode from '$lib/components/ConfigurableNode.svelte';
  import { initialGraphData, loadGraphData } from '$lib/graphData';
  import { applyAutoLayout } from '$lib/layout';
  import type {
    FlowEdge,
    FlowNode,
    GraphData,
    RenameHandleDetail
  } from '$lib/types';

  const nodeTypes = { configurable: ConfigurableNode };

  const lockStore = writable(false);
  const nodesStore = writable<FlowNode[]>([]);
  const edgesStore = writable<FlowEdge[]>([]);

  setContext('graphLock', lockStore);

  let isLoading = true;

  async function initializeGraph() {
    const graph: GraphData = await loadGraphData();
    nodesStore.set(applyAutoLayout(graph.nodes, graph.edges));
    edgesStore.set(graph.edges);
    isLoading = false;
  }

  onMount(async () => {
    try {
      await initializeGraph();
    } catch (error) {
      console.error('Failed to initialize graph', error);
      nodesStore.set(applyAutoLayout(initialGraphData.nodes, initialGraphData.edges));
      edgesStore.set(initialGraphData.edges);
      isLoading = false;
    }
  });

  function relayout() {
    const currentNodes = get(nodesStore);
    const currentEdges = get(edgesStore);
    nodesStore.set(applyAutoLayout(currentNodes, currentEdges));
  }

  function handleConnect(connection: Connection) {
    edgesStore.update((current) => addEdge(connection, current));
    relayout();
  }

  function handleRename(event: CustomEvent<RenameHandleDetail>) {
    const { nodeId, handleId, portType, label } = event.detail;
    nodesStore.update((current) =>
      current.map((node) => {
        if (node.id !== nodeId) {
          return node;
        }

        const updated = {
          ...node,
          data: {
            ...node.data,
            inputs: [...node.data.inputs],
            outputs: [...node.data.outputs]
          }
        };

        const ports = portType === 'input' ? updated.data.inputs : updated.data.outputs;
        const index = ports.findIndex((port) => port.id === handleId);
        if (index !== -1) {
          ports[index] = { ...ports[index], label };
        }

        return updated;
      })
    );
    relayout();
  }

  function toggleLock() {
    lockStore.update((value) => !value);
  }
</script>

<main class="flex h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
  <header class="flex items-center justify-between border-b border-slate-800 bg-slate-900/70 px-6 py-3">
    <h1 class="text-xl font-semibold">Svelte Flow Boilerplate</h1>
    <button
      class="rounded bg-slate-800 px-4 py-2 text-sm font-medium uppercase tracking-wide transition hover:bg-slate-700"
      on:click={toggleLock}
    >
      {#if $lockStore}
        Unlock graph
      {:else}
        Lock graph
      {/if}
    </button>
  </header>

  <section class="relative flex flex-1">
    {#if isLoading}
      <div class="absolute inset-0 flex items-center justify-center text-slate-400">
        Loading graph...
      </div>
    {/if}
    <SvelteFlow
      nodes={nodesStore}
      edges={edgesStore}
      {nodeTypes}
      fitView
      nodesDraggable={!$lockStore}
      nodesConnectable={!$lockStore}
      elementsSelectable={!$lockStore}
      zoomOnScroll={!$lockStore}
      zoomOnPinch={!$lockStore}
      panOnScroll={!$lockStore}
      onconnect={handleConnect}
      class="flex-1"
      on:rename={handleRename}
    >
      <MiniMap class="!bg-slate-900/70" />
      <Controls position="bottom-left" class="!bg-slate-900/70" />
      <Background variant={BackgroundVariant.Dots} gap={16} size={1.5} />
    </SvelteFlow>
  </section>
</main>
