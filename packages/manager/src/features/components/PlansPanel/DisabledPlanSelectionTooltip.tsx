import HelpOutline from '@mui/icons-material/HelpOutline';
import { visuallyHidden } from '@mui/utils';
import * as React from 'react';

import { IconButton } from 'src/components/IconButton';
import { Tooltip } from 'src/components/Tooltip';

import { getDisabledPlanReasonCopy } from './utils';

import type { DisabledPlanSelectionTooltipProps } from './types';

export const DisabledPlanSelectionTooltip = (
  props: DisabledPlanSelectionTooltipProps
) => {
  const {
    disabledReasons,
    hasMajorityOfPlansDisabled,
    wholePanelIsDisabled,
  } = props;
  const { planBelongsToDisabledClass, planIsTooSmall } = disabledReasons;
  const tooltipCopy = getDisabledPlanReasonCopy({
    planBelongsToDisabledClass,
    planIsTooSmall,
    wholePanelIsDisabled,
  });

  // If the entire panel is disabled, or if the majority of plans are disabled,
  // we want to visually hide the tooltip icon.
  // We keep it in the dom for accessibility purposes.
  const isVisuallyHidden = wholePanelIsDisabled || hasMajorityOfPlansDisabled;

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
      data-qa-tooltip={tooltipCopy}
      data-testid="limited-availability"
      placement="right"
      title={tooltipCopy}
    >
      <IconButton
        disableRipple
        size="small"
        sx={isVisuallyHidden ? visuallyHidden : {}}
      >
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
