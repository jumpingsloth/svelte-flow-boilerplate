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

<div class="rounded-lg border border-slate-700 bg-slate-900/80 p-4 shadow-lg">
  <h3 class="text-lg font-semibold text-slate-100">{data.label}</h3>
  <div class="mt-4 flex gap-4 text-sm">
    <div class="flex-1">
      <p class="mb-2 font-medium uppercase tracking-wide text-slate-400">Inputs</p>
      <ul class="space-y-2">
        {#if data.inputs.length === 0}
          <li class="text-xs italic text-slate-500">No inputs</li>
        {:else}
          {#each data.inputs as input}
            <li class="relative">
              <Handle
                class="absolute -left-3 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-emerald-300 bg-emerald-500/80"
                id={input.id}
                position={Position.Left}
                type="target"
              />
              <input
                class="w-full rounded bg-slate-800/80 px-2 py-1 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
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
      <p class="mb-2 font-medium uppercase tracking-wide text-slate-400">Outputs</p>
      <ul class="space-y-2">
        {#if data.outputs.length === 0}
          <li class="text-xs italic text-slate-500">No outputs</li>
        {:else}
          {#each data.outputs as output}
            <li class="relative">
              <Handle
                class="absolute -right-3 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-sky-300 bg-sky-500/80"
                id={output.id}
                position={Position.Right}
                type="source"
              />
              <input
                class="w-full rounded bg-slate-800/80 px-2 py-1 text-slate-100 outline-none focus:ring-2 focus:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
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
