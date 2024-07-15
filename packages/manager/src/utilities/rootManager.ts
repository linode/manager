import { createRoot } from 'react-dom/client';

import type { Root } from 'react-dom/client';

export const rootInstances = new Map<HTMLElement, Root>();

export function handleRoot(container: HTMLElement): Root {
  let root = rootInstances.get(container);

  if (!root) {
    root = createRoot(container);
    rootInstances.set(container, root);
  }

  return root;
}
