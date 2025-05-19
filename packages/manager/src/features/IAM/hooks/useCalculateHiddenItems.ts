import { useCallback, useEffect, useRef, useState } from 'react';

import type { PermissionType } from '@linode/api-v4';

export const useCalculateHiddenItems = (
  items: PermissionType[] | string[],
  maxRows = 2
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);
  const [showAll, setShowAll] = useState(false);

  const calculate = useCallback(() => {
    if (!containerRef.current) return;

    const tops = new Map<number, number[]>();
    let hasVisible = false;

    itemRefs.current.forEach((el, index) => {
      if (!el || el.offsetHeight === 0) return;
      const top = el.offsetTop;
      hasVisible = true;

      if (!tops.has(top)) tops.set(top, []);
      tops.get(top)!.push(index);
    });

    if (!hasVisible) {
      requestAnimationFrame(calculate);
      return;
    }

    const sortedTopGroups = Array.from(tops.values()).slice(0, maxRows);
    const visible = sortedTopGroups.flat();
    setVisibleIndexes(showAll ? items.map((_, i) => i) : visible);
  }, [items, showAll]);

  useEffect(() => {
    requestAnimationFrame(calculate);

    const onResize = () => {
      requestAnimationFrame(calculate);
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [calculate]);

  return {
    containerRef,
    itemRefs,
    visibleIndexes,
    showAll,
    setShowAll,
  };
};
