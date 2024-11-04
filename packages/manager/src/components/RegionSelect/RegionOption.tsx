import { Box, Tooltip } from '@linode/ui';
import { visuallyHidden } from '@mui/utils';
import React from 'react';

import { Flag } from 'src/components/Flag';
import { useIsGeckoEnabled } from 'src/components/RegionSelect/RegionSelect.utils';
import { Stack } from 'src/components/Stack';

import { SelectedIcon, StyledListItem } from './RegionSelect.styles';

import type { DisableRegionOption } from './RegionSelect.types';
import type { Region } from '@linode/api-v4';
import type { ListItemComponentsPropsOverrides } from '@mui/material/ListItem';

interface Props {
  disabledOptions?: DisableRegionOption;
  props: React.HTMLAttributes<HTMLLIElement>;
  region: Region;
  selected?: boolean;
}

export const RegionOption = ({
  disabledOptions,
  props,
  region,
  selected,
}: Props) => {
  const { className, onClick } = props;
  const isRegionDisabled = Boolean(disabledOptions);
  const isRegionDisabledReason = disabledOptions?.reason;
  const { isGeckoLAEnabled } = useIsGeckoEnabled();

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
        isRegionDisabled && isRegionDisabledReason ? isRegionDisabledReason : ''
      }
      disableFocusListener={!isRegionDisabled}
      disableHoverListener={!isRegionDisabled}
      disableTouchListener={!isRegionDisabled}
      enterDelay={200}
      enterNextDelay={200}
      enterTouchDelay={200}
    >
      <StyledListItem
        {...props}
        componentsProps={{
          root: {
            'data-qa-option': region.id,
            'data-testid': region.id,
          } as ListItemComponentsPropsOverrides,
        }}
        onClick={(e) =>
          isRegionDisabled ? e.preventDefault() : onClick ? onClick(e) : null
        }
        aria-disabled={undefined}
        className={isRegionDisabled ? `${className} Mui-disabled` : className}
        data-qa-disabled-item={isRegionDisabled}
      >
        <Stack alignItems="center" direction="row" gap={1} width="100%">
          <Flag country={region.country} />
          {isGeckoLAEnabled ? region.label : `${region.label} (${region.id})`}
          {isRegionDisabled && isRegionDisabledReason && (
            <Box sx={visuallyHidden}>{isRegionDisabledReason}</Box>
          )}
          <Box flexGrow={1} />
          {isGeckoLAEnabled && `(${region.id})`}
          {selected && <SelectedIcon visible />}
        </Stack>
      </StyledListItem>
    </Tooltip>
  );
};
