<script lang="ts">
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import { Handle, Position, type NodeProps } from '@xyflow/svelte';
  import type { FlowNode, NodeData, Port, PortDirection, RenameHandleDetail } from '$lib/types';
  import { createEventDispatcher } from 'svelte';

  type Props = NodeProps<FlowNode>;

  export let id: Props['id'];
  export let data: NodeData;
  export let width: Props['width'] = undefined;
  export let height: Props['height'] = undefined;
  export let sourcePosition: Props['sourcePosition'] = undefined;
  export let targetPosition: Props['targetPosition'] = undefined;
  export let dragHandle: Props['dragHandle'] = undefined;
  export let parentId: Props['parentId'] = undefined;
  export let type: Props['type'];
  export let dragging: Props['dragging'];
  export let zIndex: Props['zIndex'];
  export let selectable: Props['selectable'];
  export let deletable: Props['deletable'];
  export let selected: Props['selected'];
  export let draggable: Props['draggable'];
  export let isConnectable: Props['isConnectable'];
  export let positionAbsoluteX: Props['positionAbsoluteX'];
  export let positionAbsoluteY: Props['positionAbsoluteY'];

  const lockStore = getContext<Writable<boolean> | undefined>('graphLock');
  const dispatch = createEventDispatcher<{ rename: RenameHandleDetail }>();

  const unusedProps: Record<string, unknown> = {
    width,
    height,
    sourcePosition,
    targetPosition,
    dragHandle,
    parentId,
    type,
    dragging,
    zIndex,
    selectable,
    deletable,
    selected,
    draggable,
    isConnectable,
    positionAbsoluteX,
    positionAbsoluteY
  };
  void unusedProps;

  $: isLocked = lockStore ? $lockStore : false;

  function onPortRename(event: Event, portType: PortDirection, port: Port) {
    const target = event.target as HTMLInputElement;
    dispatch('rename', {
      nodeId: id,
      handleId: port.id,
      portType,
      label: target.value
    });
  }
</script>

<div
  class="rounded-xl border border-gray-200 bg-white p-4 shadow-lg shadow-orange-100/80 dark:border-gray-700 dark:bg-gray-800/95 dark:shadow-orange-900/20"
>
  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{data.label}</h3>
  <div class="mt-4 flex gap-4 text-sm text-gray-700 dark:text-gray-200">
    <div class="flex-1">
      <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Inputs</p>
      <ul class="space-y-2">
        {#if data.inputs.length === 0}
          <li class="text-xs italic text-gray-400 dark:text-gray-500">No inputs</li>
        {:else}
          {#each data.inputs as input}
            <li class="relative">
              <Handle
                class="absolute -left-3 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-orange-200 bg-orange-300 dark:border-orange-500 dark:bg-orange-500"
                id={input.id}
                position={Position.Left}
                type="target"
              />
              <input
                class="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-orange-400 dark:focus:ring-orange-400/60"
                value={input.label}
                on:change={(event) => onPortRename(event, 'input', input)}
                disabled={isLocked}
              />
            </li>
          {/each}
        {/if}
      </ul>
    </div>
    <div class="flex-1">
      <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Outputs</p>
      <ul class="space-y-2">
        {#if data.outputs.length === 0}
          <li class="text-xs italic text-gray-400 dark:text-gray-500">No outputs</li>
        {:else}
          {#each data.outputs as output}
            <li class="relative">
              <Handle
                class="absolute -right-3 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-orange-300 bg-orange-400 dark:border-orange-600 dark:bg-orange-500"
                id={output.id}
                position={Position.Right}
                type="source"
              />
              <input
                class="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-orange-400 dark:focus:ring-orange-400/60"
                value={output.label}
                on:change={(event) => onPortRename(event, 'output', output)}
                disabled={isLocked}
              />
            </li>
          {/each}
        {/if}
      </ul>
    </div>
  </div>
</div>

<style>
  input {
    font-family: inherit;
  }
</style>
