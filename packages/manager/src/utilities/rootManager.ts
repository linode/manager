import { createRoot } from 'react-dom/client';

import type { Root } from 'react-dom/client';

export const rootInstances = new Map<HTMLElement, Root>();

/**
 * This utility helps manage React roots efficiently,
 * ensuring that only one root is created per container and allowing reuse of existing roots when possible.
 * It's particularly useful in scenarios where you need to dynamically create and manage multiple React roots in an application. (In our case, the APP and DevTools)
 */
export const getRoot = (container: HTMLElement): Root => {
  let root = rootInstances.get(container);

  if (!root) {
    root = createRoot(container);
    rootInstances.set(container, root);
  }

  return root;
};
