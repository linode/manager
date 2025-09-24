import { Box, LinkButton } from '@linode/ui';
import React, { useLayoutEffect, useRef } from 'react';
import { useCallback } from 'react';
import { debounce } from 'throttle-debounce';

import { StyledTruncatedList } from './TruncatedList.styles';

import type { SxProps, Theme } from '@mui/material';

export interface TruncatedListProps {
  addEllipsis?: boolean;
  children?: React.ReactNode;
  collapseText?: string;
  customOverflowButton?: (hiddenItemsCount: number) => React.ReactNode;
  dataTestId?: string;
  expandText?: string;
  justifyOverflowButtonRight?: boolean;
  listContainerSx?: SxProps<Theme>;
}

type OverflowButtonProps = {
  buttonCopy: string;
  hiddenItemsCount: number;
  onClick: () => void;
};

/**
 * Checks if a child rectangle is fully contained within a parent rectangle.
 */
const rectFullyContains = (parentRect: DOMRect, childRect: DOMRect) => {
  return (
    childRect.top >= parentRect.top &&
    childRect.bottom <= parentRect.bottom &&
    childRect.left >= parentRect.left &&
    childRect.right <= parentRect.right
  );
};

export const TruncatedList = (props: TruncatedListProps) => {
  const {
    addEllipsis = false,
    children,
    collapseText = 'Hide',
    customOverflowButton,
    dataTestId,
    expandText = 'Expand',
    justifyOverflowButtonRight = false,
    listContainerSx,
  } = props;
  const [showAll, setShowAll] = React.useState(false);

  const containerRef = useRef<HTMLUListElement>(null);
  const expandedRef = useRef<HTMLUListElement>(null);

  const OverflowButton = React.memo((props: OverflowButtonProps) => {
    const { hiddenItemsCount, onClick, buttonCopy } = props;

    if (customOverflowButton) {
      return customOverflowButton(hiddenItemsCount);
    }

    return (
      <LinkButton
        onClick={onClick}
        sx={(theme) => ({
          font: theme.tokens.alias.Typography.Label.Semibold.Xs,
          paddingLeft: theme.tokens.spacing.S6,
        })}
      >
        {buttonCopy} {!showAll && `(+${hiddenItemsCount})`}
      </LinkButton>
    );
  });

  const handleToggle = () => {
    setShowAll(!showAll);
  };

  const truncate = useCallback(() => {
    if (!containerRef.current) {
      return;
    }

    const listItems = Array.from(
      containerRef.current.children
    ) as HTMLElement[];

    containerRef.current.style.overflow = showAll ? 'visible' : 'hidden';

    for (let i = 0; i < listItems.length; ++i) {
      listItems[i].hidden = i % 2 === 0;
      if (i % 2 === 0 && justifyOverflowButtonRight) {
        listItems[i].classList.remove('visible-overflow-button');
      } else if (addEllipsis) {
        listItems[i].classList.remove('last-visible-before-overflow');
      }
    }

    if (listItems.length === 1) {
      return;
    }

    const itemEl = listItems[listItems.length - 2];
    if (
      rectFullyContains(
        containerRef.current.getBoundingClientRect(),
        itemEl.getBoundingClientRect()
      )
    ) {
      return;
    }

    const numBreakpoints = Math.floor((listItems.length - 1) / 2);
    let left = 0;
    let right = numBreakpoints - 1;
    let numItemsShowingWithTruncation: null | number = null;

    while (left <= right) {
      const middle = Math.floor((left + right) / 2);

      for (let i = 0; i < middle; i += 1) {
        listItems[i * 2 + 1].hidden = false;
      }
      for (let i = middle; i < numBreakpoints; i += 1) {
        listItems[i * 2 + 1].hidden = true;
      }

      const breakpointEl = listItems[middle * 2];
      breakpointEl.hidden = false;

      if (
        rectFullyContains(
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

    for (let i = 0; i < numItemsShowingWithTruncation; i += 1) {
      listItems[i * 2 + 1].hidden = false;
    }
    for (let i = numItemsShowingWithTruncation; i < numBreakpoints; i += 1) {
      listItems[i * 2 + 1].hidden = true;
    }

    const breakpointEl = listItems[numItemsShowingWithTruncation * 2];
    breakpointEl.hidden = false;

    if (justifyOverflowButtonRight) {
      breakpointEl.classList.add('visible-overflow-button'); // Add class to the visible one
    }

    if (numItemsShowingWithTruncation > 0) {
      const lastVisibleContentIndex =
        (numItemsShowingWithTruncation - 1) * 2 + 1;
      const lastVisibleContentEl = listItems[lastVisibleContentIndex];
      if (lastVisibleContentEl && addEllipsis) {
        lastVisibleContentEl.classList.add('last-visible-before-overflow');
      }
    }
  }, [showAll, justifyOverflowButtonRight, addEllipsis]);

  useLayoutEffect(() => {
    const container = showAll ? expandedRef.current : containerRef.current;
    if (!container) return;

    let isInitialObservation = true;

    const resizeObserver = new ResizeObserver(
      debounce(150, () => {
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
      })
    );

    resizeObserver.observe(container);
    truncate();

    return () => {
      resizeObserver.unobserve(container);
    };
  }, [truncate, showAll, children]);

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
          <li
            data-testid={`${dataTestId ?? 'truncated-list'}-list-item`}
            key={i}
          >
            {item}
          </li>
        ))}
        <li>
          <OverflowButton
            buttonCopy={collapseText}
            hiddenItemsCount={0}
            onClick={handleToggle}
          />
        </li>
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
      <li data-testid={`${dataTestId ?? 'truncated-list'}-list-item`}>
        {item}
      </li>
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
