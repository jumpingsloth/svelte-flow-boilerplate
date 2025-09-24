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
  import { DarkMode } from 'flowbite-svelte';
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

<main class="flex h-screen flex-col overflow-hidden bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
  <header
    class="flex items-center justify-between border-b border-gray-200 bg-white/80 px-6 py-3 backdrop-blur dark:border-gray-700 dark:bg-gray-900/80"
  >
    <div class="flex items-center gap-3">
      <DarkMode
        ariaLabel="Toggle dark mode"
        class="focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700"
        size="lg"
      />
      <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Svelte Flow Boilerplate</h1>
    </div>
    <button
      class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
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
      <div class="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
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
      class="flex-1 bg-gray-50 dark:bg-gray-900 [--graph-bg:theme(colors.gray.50)] [--graph-pattern:theme(colors.gray.200)] [--graph-minimap-mask:rgba(17,24,39,0.15)] [--graph-control-bg:rgba(255,255,255,0.8)] [--graph-control-hover:rgba(226,232,240,0.9)] [--graph-control-border:theme(colors.gray.200)] dark:[--graph-bg:theme(colors.gray.900)] dark:[--graph-pattern:theme(colors.gray.600)] dark:[--graph-minimap-mask:rgba(15,23,42,0.5)] dark:[--graph-control-bg:rgba(17,24,39,0.85)] dark:[--graph-control-hover:rgba(55,65,81,0.7)] dark:[--graph-control-border:theme(colors.gray.700)]"
      style="--background-color: var(--graph-bg); --background-pattern-color: var(--graph-pattern); --minimap-mask-color: var(--graph-minimap-mask); --controls-button-background-color: var(--graph-control-bg); --controls-button-background-color-hover: var(--graph-control-hover); --controls-button-border-color: var(--graph-control-border)"
      on:rename={handleRename}
    >
      <MiniMap
        class="!border !border-gray-200 !bg-white/90 text-gray-600 shadow-sm dark:!border-gray-700 dark:!bg-gray-800/90 dark:text-gray-300"
      />
      <Controls
        position="bottom-left"
        class="!rounded-lg !bg-white/90 !text-gray-600 shadow-sm dark:!bg-gray-800/90 dark:!text-gray-300"
      />
      <Background
        variant={BackgroundVariant.Dots}
        gap={16}
        size={1.5}
        bgColor="var(--graph-bg)"
        patternColor="var(--graph-pattern)"
      />
    </SvelteFlow>
  </section>
</main>
