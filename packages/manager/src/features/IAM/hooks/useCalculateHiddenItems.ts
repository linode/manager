import React from 'react';

import type { PermissionType } from '@linode/api-v4';

/**
 * Custom hook to calculate hidden items
 */
export const useCalculateHiddenItems = (
  items: PermissionType[] | string[],
  showAll?: boolean
) => {
  const [numHiddenItems, setNumHiddenItems] = React.useState<number>(0);

  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const itemRefs = React.useRef<(HTMLDivElement | HTMLSpanElement)[]>([]);

  const calculateHiddenItems = React.useCallback(() => {
    if (showAll || !containerRef.current) {
      setNumHiddenItems(0);
      return;
    }

    if (!itemRefs.current) {
      return;
    }

    const containerBottom = containerRef.current.getBoundingClientRect().bottom;

    const itemsArray = Array.from(itemRefs.current);

    const firstHiddenIndex = itemsArray.findIndex(
      (item: HTMLDivElement | HTMLSpanElement) => {
        const rect = item.getBoundingClientRect();
        return rect.top >= containerBottom;
      }
    );

    const numHiddenItems =
      firstHiddenIndex !== -1 ? itemsArray.length - firstHiddenIndex : 0;

    setNumHiddenItems(numHiddenItems);
  }, [items, showAll]);

  return { calculateHiddenItems, containerRef, itemRefs, numHiddenItems };
};
