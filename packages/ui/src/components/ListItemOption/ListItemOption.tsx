import { visuallyHidden } from '@mui/utils';
import React from 'react';

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
  const isItemOptionDisabled = Boolean(disabledOptions);
  const itemOptionDisabledReason = disabledOptions?.reason;

  return (
    <Tooltip
      enterDelay={200}
      enterNextDelay={200}
      enterTouchDelay={200}
      PopperProps={{
        sx: {
          '& .MuiTooltip-tooltip': {
            minWidth: disabledOptions?.tooltipWidth ?? 215,
          },
        },
      }}
      title={
        isItemOptionDisabled && itemOptionDisabledReason
          ? itemOptionDisabledReason
          : ''
      }
    >
      <ListItem
        {...rest}
        data-qa-disabled-item={isItemOptionDisabled}
        onClick={(e) =>
          isItemOptionDisabled
            ? e.preventDefault()
            : onClick
              ? onClick(e)
              : null
        }
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
          ...(isItemOptionDisabled && {
            cursor: 'not-allowed !important',
            pointerEvents: 'unset !important' as 'unset',
          }),
        }}
      >
        {children}
        {isItemOptionDisabled && (
          <Box sx={visuallyHidden}>{itemOptionDisabledReason}</Box>
        )}
        <Box flexGrow={1} />
        {selected && <SelectedIcon visible />}
      </ListItem>
    </Tooltip>
  );
};
