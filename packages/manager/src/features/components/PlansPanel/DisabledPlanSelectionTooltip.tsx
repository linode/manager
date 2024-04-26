import HelpOutline from '@mui/icons-material/HelpOutline';
import * as React from 'react';

import { IconButton } from 'src/components/IconButton';
import { Tooltip } from 'src/components/Tooltip';

import { LIMITED_AVAILABILITY_TEXT } from './constants';

import type { PlanSelectionAvailabilityTypes } from './types';

interface disabledTooltipReasons extends PlanSelectionAvailabilityTypes {
  planIsTooSmall: boolean;
}

export interface DisabledPlanSelectionTooltipProps {
  disabledReasons: disabledTooltipReasons;
  hasMajorityOfPlansDisabled: boolean;
  wholePanelIsDisabled: boolean | undefined;
}

export const DisabledPlanSelectionTooltip = (
  props: DisabledPlanSelectionTooltipProps
) => {
  const {
    disabledReasons,
    hasMajorityOfPlansDisabled,
    wholePanelIsDisabled,
  } = props;
  const {
    planBelongsToDisabledClass,
    planHasLimitedAvailability,
    planIs512Gb,
    planIsTooSmall,
  } = disabledReasons;

  const showTooltip =
    !wholePanelIsDisabled &&
    !hasMajorityOfPlansDisabled &&
    (planBelongsToDisabledClass ||
      planIs512Gb ||
      planHasLimitedAvailability ||
      planIsTooSmall);

  if (!showTooltip) {
    return null;
  }

  const pickTooltipCopy = (): string => {
    if (planBelongsToDisabledClass) {
      return 'This plan is not available in this region.';
    }

    if (planIsTooSmall) {
      return 'This plan is not available for Linodes with smaller disks.';
    }

    return LIMITED_AVAILABILITY_TEXT;
  };

  return (
    <Tooltip
      PopperProps={{
        sx: {
          '& .MuiTooltip-tooltip': {
            width: 175,
          },
        },
      }}
      sx={{
        top: -2,
      }}
      data-qa-tooltip={pickTooltipCopy()}
      data-testid="limited-availability"
      placement="right"
      title={pickTooltipCopy()}
    >
      <IconButton disableRipple size="small">
        <HelpOutline
          sx={{
            height: 16,
            width: 16,
          }}
        />
      </IconButton>
    </Tooltip>
  );
};
