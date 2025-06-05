import React, { useLayoutEffect, useRef, useState } from 'react';

import type { PermissionType } from '@linode/api-v4';

/**
 * Custom hook to calculate hidden items
 */
export const useCalculateHiddenItems = (
  items: PermissionType[] | string[],
  showAll?: boolean
) => {
  const [numHiddenItems, setNumHiddenItems] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | HTMLSpanElement)[]>([]);

  const calculateHiddenItems = React.useCallback(() => {
    if (showAll) {
      setNumHiddenItems(0);
      return;
    }

    if (!containerRef.current || !itemRefs.current) {
      return;
    }

    const containerBottom = containerRef.current.getBoundingClientRect().bottom;

    const itemsArray = Array.from(itemRefs.current);

    const firstHiddenIndex = itemsArray.findIndex(
      (item: HTMLDivElement | HTMLSpanElement) => {
        if (!item) {
          return false;
        }
        const rect = item.getBoundingClientRect();
        return rect.top >= containerBottom;
      }
    );

    const numHiddenItems =
      firstHiddenIndex !== -1 ? itemsArray.length - firstHiddenIndex : 0;

    setNumHiddenItems(numHiddenItems);
  }, [showAll]);

  useLayoutEffect(() => {
    let rafId: number;

    const run = () => {
      const container = containerRef.current;
      if (!container || container.offsetHeight === 0) {
        rafId = requestAnimationFrame(run);
        return;
      }

      calculateHiddenItems();
    };

    rafId = requestAnimationFrame(run);

    return () => cancelAnimationFrame(rafId);
  }, [items, calculateHiddenItems]);

  return { calculateHiddenItems, containerRef, itemRefs, numHiddenItems };
};
