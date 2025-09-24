<script lang="ts">
  import '@xyflow/svelte/dist/style.css';
  import { get, writable } from 'svelte/store';
  import { onMount, setContext, tick } from 'svelte';
  import {
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    SvelteFlow,
    type FitViewOptions
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

  const DEFAULT_FIT_VIEW_OPTIONS: FitViewOptions = {
    padding: 0.24,
    includeHiddenNodes: true,
    minZoom: 0.2
  };

  let shouldFitView = true;
  let fitViewOptions: FitViewOptions = { ...DEFAULT_FIT_VIEW_OPTIONS };

  setContext('graphLock', lockStore);

  let isLoading = true;

  async function requestFitView() {
    await tick();
    shouldFitView = false;
    await tick();
    fitViewOptions = { ...DEFAULT_FIT_VIEW_OPTIONS };
    shouldFitView = true;
  }

  async function initializeGraph() {
    const graph: GraphData = await loadGraphData();
    nodesStore.set(applyAutoLayout(graph.nodes, graph.edges));
    edgesStore.set(graph.edges);
    await requestFitView();
    isLoading = false;
  }

  onMount(async () => {
    try {
      await initializeGraph();
    } catch (error) {
      console.error('Failed to initialize graph', error);
      nodesStore.set(applyAutoLayout(initialGraphData.nodes, initialGraphData.edges));
      edgesStore.set(initialGraphData.edges);
      await requestFitView();
      isLoading = false;
    }
  });

  async function relayout() {
    const currentNodes = get(nodesStore);
    const currentEdges = get(edgesStore);
    nodesStore.set(applyAutoLayout(currentNodes, currentEdges));
    await requestFitView();
  }

  function handleConnect(connection: Connection) {
    edgesStore.update((current) => addEdge(connection, current));
    void relayout();
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
    void relayout();
  }

  function toggleLock() {
    lockStore.update((value) => !value);
  }
</script>

<main class="flex h-screen flex-col overflow-hidden bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
  <header
    class="flex items-center justify-between border-b border-gray-200 bg-gray-50/95 px-6 py-3 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95"
  >
    <div class="flex items-center gap-3">
      <DarkMode
        ariaLabel="Toggle dark mode"
        class="focus:outline-none focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-500"
        size="lg"
      />
      <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Svelte Flow Boilerplate</h1>
    </div>
    <button
      class="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200 dark:bg-orange-500 dark:hover:bg-orange-600 dark:focus:ring-orange-500/60"
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
      fitView={shouldFitView}
      fitViewOptions={fitViewOptions}
      minZoom={0.2}
      nodesDraggable={!$lockStore}
      nodesConnectable={!$lockStore}
      elementsSelectable={!$lockStore}
      zoomOnScroll={!$lockStore}
      zoomOnPinch={!$lockStore}
      panOnScroll={!$lockStore}
      onconnect={handleConnect}
      class="flex-1 bg-gray-50 dark:bg-gray-900 [--graph-bg:theme(colors.gray.50)] [--graph-pattern:rgba(249,115,22,0.16)] [--graph-minimap-mask:rgba(17,24,39,0.12)] [--graph-control-bg:theme(colors.white)] [--graph-control-hover:theme(colors.orange.50)] [--graph-control-border:theme(colors.gray.200)] dark:[--graph-bg:theme(colors.gray.900)] dark:[--graph-pattern:rgba(251,191,36,0.28)] dark:[--graph-minimap-mask:rgba(15,23,42,0.45)] dark:[--graph-control-bg:theme(colors.gray.800)] dark:[--graph-control-hover:rgba(249,115,22,0.25)] dark:[--graph-control-border:theme(colors.gray.700)]"
      style="--background-color: var(--graph-bg); --background-pattern-color: var(--graph-pattern); --minimap-mask-color: var(--graph-minimap-mask); --controls-button-background-color: var(--graph-control-bg); --controls-button-background-color-hover: var(--graph-control-hover); --controls-button-border-color: var(--graph-control-border)"
      on:rename={handleRename}
    >
      <MiniMap
        class="!border !border-gray-200 !bg-white text-gray-600 shadow-sm dark:!border-gray-700 dark:!bg-gray-800/90 dark:text-gray-300"
      />
      <Controls
        position="bottom-left"
        class="!rounded-lg !bg-white !text-orange-500 shadow-sm dark:!bg-gray-800/90 dark:!text-orange-300"
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
