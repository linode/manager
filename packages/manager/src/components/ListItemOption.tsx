import { Box, Tooltip } from '@linode/ui';
import { styled } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import React from 'react';

import { SelectedIcon } from 'src/components/Autocomplete/Autocomplete.styles';
import { ListItem } from 'src/components/ListItem';

import type { ListItemComponentsPropsOverrides } from '@mui/material/ListItem';

export interface ListItemProps<T> {
  children?: React.ReactNode;
  disabledOptions?: DisableItemOption;
  item: T & { id: string };
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
  props,
  selected,
}: ListItemProps<T>) => {
  const { className, onClick } = props;
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
        {...props}
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
        aria-disabled={undefined}
        data-qa-disabled-item={isItemOptionDisabled}
      >
        {children}
        {isItemOptionDisabled && (
          <Box
            sx={visuallyHidden}
          >{`Option disabled: ${itemOptionDisabledReason}`}</Box>
        )}
        {selected && <SelectedIcon visible />}
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
