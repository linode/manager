import { TooltipIcon } from '@linode/ui';
import * as React from 'react';

interface DisabledPlanSelectionTooltipProps {
  tooltipCopy: string;
}

export const DisabledPlanSelectionTooltip = (
  props: DisabledPlanSelectionTooltipProps
) => {
  const { tooltipCopy } = props;

  return (
    <TooltipIcon
      data-qa-tooltip={tooltipCopy}
      data-testid="disabled-plan-tooltip"
      status="info"
      sxTooltipIcon={{
        top: -2,
      }}
      text={tooltipCopy}
      tooltipPosition="right"
    />
  );
};
