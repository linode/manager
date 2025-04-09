import { styled } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import React from 'react';

import { Box } from '../Box';
import { ListItem } from '../ListItem';
import { SelectedIcon } from '../Autocomplete';
import { Tooltip } from '../Tooltip';

import type { ListItemComponentsPropsOverrides } from '@mui/material/ListItem';

export interface ListItemOptionProps<T> {
  children?: React.ReactNode;
  disabledOptions?: DisableItemOption;
  item: T & { id: number | string };
  maxHeight?: number;
  props: React.HTMLAttributes<HTMLLIElement>;
  selected?: boolean;
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
  const { className, onClick, ...rest } = props;
  const isItemOptionDisabled = Boolean(disabledOptions);
  const itemOptionDisabledReason = disabledOptions?.reason;

  return (
    <Tooltip
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
      disableFocusListener={!isItemOptionDisabled}
      disableHoverListener={!isItemOptionDisabled}
      disableTouchListener={!isItemOptionDisabled}
      enterDelay={200}
      enterNextDelay={200}
      enterTouchDelay={200}
    >
      <StyledDisabledItem
        {...rest}
        className={
          isItemOptionDisabled ? `${className} Mui-disabled` : className
        }
        componentsProps={{
          root: {
            'data-qa-option': item.id,
            'data-testid': item.id,
          } as ListItemComponentsPropsOverrides,
        }}
        onClick={(e) =>
          isItemOptionDisabled
            ? e.preventDefault()
            : onClick
              ? onClick(e)
              : null
        }
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          maxHeight,
        }}
        aria-disabled={undefined}
        data-qa-disabled-item={isItemOptionDisabled}
      >
        {children}
        {isItemOptionDisabled && (
          <Box sx={visuallyHidden}>{itemOptionDisabledReason}</Box>
        )}
        {selected && <SelectedIcon style={{ marginLeft: 8 }} visible />}
      </StyledDisabledItem>
    </Tooltip>
  );
};

export const StyledDisabledItem = styled(ListItem, {
  label: 'StyledDisabledItem',
})(() => ({
  '&.Mui-disabled': {
    cursor: 'not-allowed',
  },
  '&.MuiAutocomplete-option': {
    minHeight: 'auto !important',
    padding: '8px 10px !important',
  },
  '&.MuiListItem-root[aria-disabled="true"]:active': {
    pointerEvents: 'none !important',
  },
}));
