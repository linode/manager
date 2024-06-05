import { visuallyHidden } from '@mui/utils';
import React from 'react';

import DistributedRegion from 'src/assets/icons/entityIcons/distributed-region.svg';
import { Box } from 'src/components/Box';
import { Flag } from 'src/components/Flag';
import { Tooltip } from 'src/components/Tooltip';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { FlagSet } from 'src/featureFlags';

import {
  SelectedIcon,
  StyledFlagContainer,
  StyledListItem,
  sxDistributedRegionIcon,
} from './RegionSelect.styles';
import { RegionSelectOption } from './RegionSelect.types';

import type { ListItemComponentsPropsOverrides } from '@mui/material/ListItem';

type Props = {
  displayDistributedRegionIcon?: boolean;
  flags?: FlagSet;
  option: RegionSelectOption;
  props: React.HTMLAttributes<HTMLLIElement>;
  selected?: boolean;
};

export const RegionOption = ({
  displayDistributedRegionIcon,
  flags,
  option,
  props,
  selected,
}: Props) => {
  const { className, onClick } = props;
  const { data, disabledProps, label, value } = option;
  const isRegionDisabled = Boolean(disabledProps?.disabled);
  const isRegionDisabledReason = disabledProps?.reason;
  const isGeckoGA = flags?.gecko2?.enabled && flags.gecko2.ga;

  return (
    <Tooltip
      PopperProps={{
        sx: {
          '& .MuiTooltip-tooltip': {
            minWidth: disabledProps?.tooltipWidth ?? 215,
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
      key={value}
    >
      <StyledListItem
        {...props}
        componentsProps={{
          root: {
            'data-qa-option': value,
            'data-testid': value,
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
              <Flag country={data.country} />
            </StyledFlagContainer>
            {label}
            {displayDistributedRegionIcon && (
              <Box sx={visuallyHidden}>
                &nbsp;(This region is a distributed region.)
              </Box>
            )}
            {isRegionDisabled && isRegionDisabledReason && (
              <Box sx={visuallyHidden}>{isRegionDisabledReason}</Box>
            )}
          </Box>
          {isGeckoGA && `(${value})`}
          {selected && <SelectedIcon visible={selected} />}
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
