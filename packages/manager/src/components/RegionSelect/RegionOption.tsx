import { visuallyHidden } from '@mui/utils';
import React from 'react';

import DistributedRegion from 'src/assets/icons/entityIcons/distributed-region.svg';
import { Box } from 'src/components/Box';
import { Flag } from 'src/components/Flag';
import { Tooltip } from 'src/components/Tooltip';
import { TooltipIcon } from 'src/components/TooltipIcon';

import {
  SelectedIcon,
  StyledFlagContainer,
  StyledListItem,
  sxDistributedRegionIcon,
} from './RegionSelect.styles';

import type { DisableRegionOption } from './RegionSelect.types';
import type { Region } from '@linode/api-v4';
import type { ListItemComponentsPropsOverrides } from '@mui/material/ListItem';
import type { FlagSet } from 'src/featureFlags';

interface Props {
  disabledOptions?: DisableRegionOption;
  displayDistributedRegionIcon?: boolean;
  flags?: FlagSet;
  props: React.HTMLAttributes<HTMLLIElement>;
  region: Region;
  selected?: boolean;
}

export const RegionOption = ({
  disabledOptions,
  displayDistributedRegionIcon,
  flags,
  props,
  region,
  selected,
}: Props) => {
  const { className, onClick } = props;
  const isRegionDisabled = Boolean(disabledOptions);
  const isRegionDisabledReason = disabledOptions?.reason;
  const isGeckoGA = flags?.gecko2?.enabled && flags.gecko2.ga;

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
      >
        <>
          <Box alignItems="center" display="flex" flexGrow={1}>
            <StyledFlagContainer>
              <Flag country={region.country} />
            </StyledFlagContainer>
            {isGeckoGA ? region.label : `${region.label} (${region.id})`}
            {displayDistributedRegionIcon && (
              <Box sx={visuallyHidden}>
                &nbsp;(This region is a distributed region.)
              </Box>
            )}
            {isRegionDisabled && isRegionDisabledReason && (
              <Box sx={visuallyHidden}>{isRegionDisabledReason}</Box>
            )}
          </Box>
          {isGeckoGA && `(${region.id})`}
          {selected && <SelectedIcon visible />}
          {displayDistributedRegionIcon && (
            <TooltipIcon
              icon={<DistributedRegion />}
              status="other"
              sxTooltipIcon={sxDistributedRegionIcon}
              text="This region is a distributed region."
            />
          )}
        </>
      </StyledListItem>
    </Tooltip>
  );
};
