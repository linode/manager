import { IconButton, Tooltip } from '@linode/ui';
import HelpOutline from '@mui/icons-material/HelpOutline';
import * as React from 'react';

interface DisabledPlanSelectionTooltipProps {
  tooltipCopy: string;
}

export const DisabledPlanSelectionTooltip = (
  props: DisabledPlanSelectionTooltipProps
) => {
  const { tooltipCopy } = props;

  return (
    <Tooltip
      data-qa-tooltip={tooltipCopy}
      data-testid="disabled-plan-tooltip"
      placement="right"
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
