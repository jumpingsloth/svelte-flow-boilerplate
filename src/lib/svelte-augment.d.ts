import type { RenameHandleDetail } from '$lib/types';

declare namespace svelteHTML {
  interface DOMAttributes<T> {
    'on:rename'?: (event: CustomEvent<RenameHandleDetail>) => void;
  }
}
