import { visuallyHidden } from '@mui/utils';
import React from 'react';

import EdgeServer from 'src/assets/icons/entityIcons/edge-server.svg';
import { Box } from 'src/components/Box';
import { Flag } from 'src/components/Flag';
import { Tooltip } from 'src/components/Tooltip';
import { TooltipIcon } from 'src/components/TooltipIcon';

import {
  SelectedIcon,
  StyledFlagContainer,
  StyledListItem,
  sxEdgeIcon,
} from './RegionSelect.styles';
import { RegionSelectOption } from './RegionSelect.types';

import type { ListItemComponentsPropsOverrides } from '@mui/material/ListItem';

type Props = {
  displayEdgeServerIcon?: boolean;
  option: RegionSelectOption;
  props: React.HTMLAttributes<HTMLLIElement>;
  selected?: boolean;
};

export const RegionOption = ({
  displayEdgeServerIcon,
  option,
  props,
  selected,
}: Props) => {
  const { className, onClick } = props;
  const { data, disabledProps, label, value } = option;
  const isRegionDisabled = Boolean(disabledProps?.disabled);
  const isRegionDisabledReason = disabledProps?.reason;

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
            {displayEdgeServerIcon && (
              <Box sx={visuallyHidden}>
                &nbsp;(This region is an Edge site.)
              </Box>
            )}
            {isRegionDisabled && isRegionDisabledReason && (
              <Box sx={visuallyHidden}>{isRegionDisabledReason}</Box>
            )}
          </Box>
          {selected && <SelectedIcon visible={selected} />}
          {displayEdgeServerIcon && (
            <TooltipIcon
              icon={<EdgeServer />}
              status="other"
              sxTooltipIcon={sxEdgeIcon}
              text="This region is an edge site."
            />
          )}
        </>
      </StyledListItem>
    </Tooltip>
  );
};
