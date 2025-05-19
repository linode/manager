import { useEffect, useRef, useState } from 'react';

import type { PermissionType } from '@linode/api-v4';

export const useCalculateHiddenItems = (
  items: PermissionType[] | string[],
  maxRows = 2
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);
  const [showAll, setShowAll] = useState(false);

  const calculate = () => {
    if (!containerRef.current) return;

    const tops = new Map<number, number[]>();
    let atLeastOneVisible = false;

    itemRefs.current.forEach((el, index) => {
      if (!el || el.offsetHeight === 0) return;
      const top = el.offsetTop;

      atLeastOneVisible = true;

      if (!tops.has(top)) tops.set(top, []);
      tops.get(top)!.push(index);
    });

    if (!atLeastOneVisible) {
      setTimeout(calculate, 50);
      return;
    }

    const sortedTopGroups = Array.from(tops.values()).slice(0, maxRows);
    const visible = sortedTopGroups.flat();
    setVisibleIndexes(showAll ? items.map((_, i) => i) : visible);
  };

  useEffect(() => {
    const delayedCalc = () => {
      setTimeout(() => {
        requestAnimationFrame(calculate);
      }, 0);
    };

    delayedCalc();
    window.addEventListener('resize', delayedCalc);

    return () => {
      window.removeEventListener('resize', delayedCalc);
    };
  }, [items, showAll]);

  return {
    containerRef,
    itemRefs,
    visibleIndexes,
    showAll,
    setShowAll,
  };
};
