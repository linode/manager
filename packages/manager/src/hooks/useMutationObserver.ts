import { useEffect, useState } from 'react';

/**
 * Attaches a MutationObserver to the provided element.
 */
export const useMutationObserver = (
  el: HTMLElement | null,
  options: MutationObserverInit
) => {
  const [lastMutations, setLastMutations] = useState<MutationRecord[]>();
  useEffect(() => {
    if (el == null) {
      return;
    }
    const observer = new MutationObserver((mutations) => {
      setLastMutations(mutations);
    });
    observer.observe(el, options);
    return () => {
      observer.disconnect();
    };
  }, [el, options]);
  return lastMutations;
};
