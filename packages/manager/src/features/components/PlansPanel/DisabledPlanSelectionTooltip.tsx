import HelpOutline from '@mui/icons-material/HelpOutline';
import * as React from 'react';

import { IconButton } from 'src/components/IconButton';
import { Tooltip } from 'src/components/Tooltip';

interface DisabledPlanSelectionTooltipProps {
  tooltipCopy: string;
}

export const DisabledPlanSelectionTooltip = (
  props: DisabledPlanSelectionTooltipProps
) => {
  const { tooltipCopy } = props;

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
      data-testid="disabled-plan-tooltip"
      placement="right"
      title={tooltipCopy}
    >
      <IconButton disableRipple size="small">
        <HelpOutline
          sx={{
            height: 17,
            width: 17,
          }}
        />
      </IconButton>
    </Tooltip>
  );
};
