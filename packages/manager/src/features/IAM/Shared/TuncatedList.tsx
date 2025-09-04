import { StyledLinkButton } from '@linode/ui';

import type { PermissionType } from '@linode/api-v4';
import type { SxProps, Theme } from '@mui/material';

/**
 * Custom hook to calculate hidden items
 */
export const useCalculateHiddenItems = (
  items: PermissionType[] | string[],
  showAll?: boolean
) => {
  const [numHiddenItems, setNumHiddenItems] = React.useState<number>(0);
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

import React, { useLayoutEffect, useRef } from 'react';
import { useCallback } from 'react';

export interface TruncatedListProps {
  children?: React.ReactNode;
  className?: string;
  collapseText?: string;
  expandText?: string;
  overflowButtonSx?: SxProps<Theme>;
}

type OverflowButtonProps = {
  buttonCopy: string;
  buttonSx?: SxProps<Theme>;
  hiddenItemsCount: number;
  onClick: () => void;
};

const rectContainsRect = (parent: DOMRect, child: DOMRect) => {
  return (
    child.top >= parent.top &&
    child.bottom <= parent.bottom &&
    child.left >= parent.left &&
    child.right <= parent.right
  );
};

export const TruncatedList = (props: TruncatedListProps) => {
  const {
    children,
    className,
    collapseText = 'Hide',
    expandText = 'Expand',
  } = props;
  const [showAll, setShowAll] = React.useState(false);

  const containerRef = useRef<HTMLUListElement>(null);

  const OverflowButton = React.memo((props: OverflowButtonProps) => {
    const { hiddenItemsCount, onClick, buttonCopy } = props;

    return (
      <StyledLinkButton
        onClick={onClick}
        sx={(theme) => ({
          font: theme.tokens.alias.Typography.Label.Semibold.Xs,
          paddingLeft: theme.tokens.spacing.S6,
        })}
      >
        {buttonCopy} {!showAll && `(+${hiddenItemsCount})`}
      </StyledLinkButton>
    );
  });

  const handleToggle = () => {
    setShowAll(!showAll);
  };

  const truncate = useCallback(() => {
    if (!containerRef.current) {
      return;
    }

    const childNodes = Array.from(
      containerRef.current.children
    ) as HTMLElement[];

    containerRef.current.style.overflow = showAll ? 'visible' : 'hidden';

    // Initially hide all overflow indicators
    for (let i = 0; i < childNodes.length; ++i) {
      childNodes[i].hidden = i % 2 === 0;
    }

    if (childNodes.length === 1) {
      return;
    }

    const itemEl = childNodes[childNodes.length - 2];
    if (
      rectContainsRect(
        containerRef.current.getBoundingClientRect(),
        itemEl.getBoundingClientRect()
      )
    ) {
      return;
    }

    const numBreakpoints = Math.floor((childNodes.length - 1) / 2);
    let left = 0;
    let right = numBreakpoints - 1;
    let numItemsShowingWithTruncation: null | number = null;

    while (left <= right) {
      const middle = Math.floor((left + right) / 2);

      // show all items before the activeBreakpoint
      for (let i = 0; i < middle; i += 1) {
        childNodes[i * 2 + 1].hidden = false;
      }
      // hide all items after the activeBreakpoint
      for (let i = middle; i < numBreakpoints; i += 1) {
        childNodes[i * 2 + 1].hidden = true;
      }

      const breakpointEl = childNodes[middle * 2];
      breakpointEl.hidden = false;

      if (
        rectContainsRect(
          containerRef.current.getBoundingClientRect(),
          breakpointEl.getBoundingClientRect()
        )
      ) {
        numItemsShowingWithTruncation = middle;
        left = middle + 1;
      } else {
        right = middle - 1;
      }

      breakpointEl.hidden = true;
    }

    if (numItemsShowingWithTruncation === null) {
      return;
    }

    // show all items before the activeBreakpoint
    for (let i = 0; i < numItemsShowingWithTruncation; i += 1) {
      childNodes[i * 2 + 1].hidden = false;
    }
    // hide all items after activeBreakpoint
    for (let i = numItemsShowingWithTruncation; i < numBreakpoints; i += 1) {
      childNodes[i * 2 + 1].hidden = true;
    }

    const breakpointEl = childNodes[numItemsShowingWithTruncation * 2];
    breakpointEl.hidden = false;
  }, [showAll]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      truncate();
    });

    resizeObserver.observe(container);
    truncate();

    return () => {
      resizeObserver.unobserve(container);
    };
  }, [truncate]);

  const childArray = React.Children.toArray(children);

  if (showAll) {
    return (
      <ul className={`${className ?? ''} expanded`}>
        {childArray.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
        <OverflowButton
          buttonCopy={collapseText}
          hiddenItemsCount={0}
          onClick={handleToggle}
        />
      </ul>
    );
  }

  const items = childArray.map((item, i) => (
    <React.Fragment key={i}>
      <li hidden>
        <OverflowButton
          buttonCopy={expandText}
          hiddenItemsCount={childArray.length - i}
          onClick={handleToggle}
        />
      </li>
      <li>{item}</li>
    </React.Fragment>
  ));

  return (
    <ul className={className ?? ''} ref={containerRef}>
      {showAll ? null : (
        <>
          {items}
          <li hidden>
            <OverflowButton
              buttonCopy={expandText}
              hiddenItemsCount={0}
              onClick={handleToggle}
            />
          </li>
        </>
      )}
    </ul>
  );
};
