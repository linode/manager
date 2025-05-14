import type React from 'react';
import { useEffect, useRef, useState } from 'react';

import type { PermissionType } from '@linode/api-v4';

/**
 * Custom hook to calculate hidden items
 */

type Props = {
  containerRef: React.RefObject<HTMLDivElement>;
  itemRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  setShowAll: (value: boolean) => void;
  showAll: boolean;
  visibleIndexes: number[];
};

export const useCalculateHiddenItems = (
  items: PermissionType[] | string[]
): Props => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!containerRef.current || items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (showAll) {
          setVisibleIndexes(items.map((_, i) => i));
          return;
        }
        const visible = entries
          .filter(
            (entry) => entry.isIntersecting && entry.intersectionRatio >= 1
          )
          .map((entry) => Number(entry.target.getAttribute('data-index')));

        setVisibleIndexes(visible);
      },
      {
        root: containerRef.current,
        threshold: 1.0,
      }
    );
    // observe all items
    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    // force re-observe on resize
    const handleResize = () => {
      itemRefs.current.forEach((el) => {
        if (el) {
          observer.unobserve(el);
          observer.observe(el);
        }
      });
    };
    window.addEventListener('resize', handleResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [items, showAll]);

  return {
    containerRef,
    itemRefs,
    showAll,
    setShowAll,
    visibleIndexes,
  };
};
