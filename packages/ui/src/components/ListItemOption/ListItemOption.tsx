import { visuallyHidden } from '@mui/utils';
import type { JSX } from 'react';
import React, { useEffect, useRef, useState } from 'react';

import { SelectedIcon } from '../Autocomplete';
import { Box } from '../Box';
import { ListItem } from '../ListItem';
import { Tooltip } from '../Tooltip';

import type { ListItemComponentsPropsOverrides } from '@mui/material/ListItem';

export interface ListItemOptionProps<T> {
  children?: React.ReactNode;
  disabledOptions?: DisableItemOption;
  item: T & { id: number | string };
  maxHeight?: number;
  props: React.HTMLAttributes<HTMLLIElement>;
  selected: boolean;
}

export interface DisableItemOption {
  /**
   * The reason the item option is disabled.
   * This is shown to the user as a tooltip.
   */
  reason: JSX.Element | string;
  /**
   * An optional minWith applied to the tooltip
   * @default 215
   */
  tooltipWidth?: number;
}

export const ListItemOption = <T,>({
  children,
  disabledOptions,
  item,
  maxHeight,
  props,
  selected,
}: ListItemOptionProps<T>) => {
  const { onClick, ...rest } = props;
  const isOptionDisabled = Boolean(disabledOptions);
  const disabledReason = disabledOptions?.reason;

  // Used to control the Tooltip
  const [isDisabledItemFocused, setIsDisabledItemFocused] = useState(false);
  const [isDisabledItemInView, setIsDisabledItemInView] = useState(false);
  const listItemRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!listItemRef.current) {
      // Ensure ref is established
      return;
    }
    if (!isOptionDisabled) {
      // We don't need to setup the observers for options that are enabled. They won't have a tooltip
      return;
    }

    const intersectionObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setIsDisabledItemInView(true);
      } else {
        setIsDisabledItemInView(false);
      }
    });
    intersectionObserver.observe(listItemRef.current);

    const mutationObserver = new MutationObserver(() => {
      const className = listItemRef.current?.className;
      const hasFocusedClass = className?.includes('Mui-focused') ?? false;
      if (hasFocusedClass) {
        setIsDisabledItemFocused(true);
      } else if (!hasFocusedClass) {
        setIsDisabledItemFocused(false);
      }
    });

    mutationObserver.observe(listItemRef.current, {
      attributeFilter: ['class'],
    });

    return () => {
      mutationObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [isOptionDisabled]);

  const Option = (
    <ListItem
      {...rest}
      data-qa-disabled-item={isOptionDisabled}
      onClick={(e) =>
        isOptionDisabled ? e.preventDefault() : onClick ? onClick(e) : null
      }
      ref={listItemRef}
      slotProps={{
        root: {
          'data-qa-option': item.id,
          'data-testid': item.id,
        } as ListItemComponentsPropsOverrides,
      }}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        maxHeight,
        gap: 1,
        ...(isOptionDisabled && {
          cursor: 'not-allowed !important',
          pointerEvents: 'unset !important' as 'unset',
        }),
      }}
    >
      {children}
      {isOptionDisabled && <Box sx={visuallyHidden}>{disabledReason}</Box>}
      <Box flexGrow={1} />
      {selected && <SelectedIcon visible />}
    </ListItem>
  );

  if (isOptionDisabled) {
    return (
      <Tooltip
        open={isDisabledItemFocused && isDisabledItemInView}
        slotProps={{
          tooltip: {
            sx: {
              minWidth: disabledOptions?.tooltipWidth ?? 215,
            },
          },
        }}
        title={disabledReason}
      >
        {Option}
      </Tooltip>
    );
  }

  return Option;
};
