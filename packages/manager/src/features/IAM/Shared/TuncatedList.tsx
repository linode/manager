import { Box, StyledLinkButton } from '@linode/ui';
import React, { useLayoutEffect, useRef } from 'react';
import { useCallback } from 'react';

import { StyledTruncatedList } from './TruncatedListStyles';

import type { SxProps, Theme } from '@mui/material';

export interface TruncatedListProps {
  children?: React.ReactNode;
  collapseText?: string;
  dataTestId?: string;
  expandText?: string;
  listContainerSx?: SxProps<Theme>;
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
    collapseText = 'Hide',
    dataTestId,
    expandText = 'Expand',
    listContainerSx,
  } = props;
  const [showAll, setShowAll] = React.useState(false);

  const containerRef = useRef<HTMLUListElement>(null);
  const expandedRef = useRef<HTMLUListElement>(null);

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

    const litsItems = Array.from(
      containerRef.current.children
    ) as HTMLElement[];

    containerRef.current.style.overflow = showAll ? 'visible' : 'hidden';

    // Initially hide all overflow indicators
    for (let i = 0; i < litsItems.length; ++i) {
      litsItems[i].hidden = i % 2 === 0;
    }

    if (litsItems.length === 1) {
      return;
    }

    const itemEl = litsItems[litsItems.length - 2];
    if (
      rectContainsRect(
        containerRef.current.getBoundingClientRect(),
        itemEl.getBoundingClientRect()
      )
    ) {
      return;
    }

    const numBreakpoints = Math.floor((litsItems.length - 1) / 2);
    let left = 0;
    let right = numBreakpoints - 1;
    let numItemsShowingWithTruncation: null | number = null;

    while (left <= right) {
      const middle = Math.floor((left + right) / 2);

      // show all items before the activeBreakpoint
      for (let i = 0; i < middle; i += 1) {
        litsItems[i * 2 + 1].hidden = false;
      }
      // hide all items after the activeBreakpoint
      for (let i = middle; i < numBreakpoints; i += 1) {
        litsItems[i * 2 + 1].hidden = true;
      }

      const breakpointEl = litsItems[middle * 2];
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
      litsItems[i * 2 + 1].hidden = false;
    }
    // hide all items after activeBreakpoint
    for (let i = numItemsShowingWithTruncation; i < numBreakpoints; i += 1) {
      litsItems[i * 2 + 1].hidden = true;
    }

    const breakpointEl = litsItems[numItemsShowingWithTruncation * 2];
    breakpointEl.hidden = false;
  }, [showAll]);

  useLayoutEffect(() => {
    const container = showAll ? expandedRef.current : containerRef.current;
    if (!container) return;

    let isInitialObservation = true;

    const resizeObserver = new ResizeObserver(() => {
      if (isInitialObservation) {
        isInitialObservation = false;
        truncate();
        return;
      }

      // Only reset to collapsed on actual resize events, not initial observation
      if (showAll) {
        setShowAll(false);
      }
      truncate();
    });

    resizeObserver.observe(container);
    truncate();

    return () => {
      resizeObserver.unobserve(container);
    };
  }, [truncate, showAll]);

  const childArray = React.Children.toArray(children);

  if (showAll) {
    return (
      <StyledTruncatedList
        className="expanded"
        data-testid={dataTestId}
        ref={expandedRef}
        sx={listContainerSx}
      >
        {childArray.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
        <OverflowButton
          buttonCopy={collapseText}
          hiddenItemsCount={0}
          onClick={handleToggle}
        />
      </StyledTruncatedList>
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
    <Box>
      <StyledTruncatedList
        data-testid={dataTestId}
        ref={containerRef}
        sx={listContainerSx}
      >
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
      </StyledTruncatedList>
    </Box>
  );
};
