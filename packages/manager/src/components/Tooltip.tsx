import { default as _Tooltip, tooltipClasses } from '@mui/material/Tooltip';
import React from 'react';

import type { TooltipProps } from '@mui/material/Tooltip';

interface TooltipDataAttribute extends TooltipProps {
  ['data-qa-tooltip']: string | undefined;
  title: React.ReactNode;
}

interface TooltipNonDataAttribute extends TooltipProps {
  title: string;
}

// Discriminated union to enforce `data-qa-tooltip` if title is a ReactNode
export type EnhancedTooltipProps =
  | TooltipDataAttribute
  | TooltipNonDataAttribute;

/**
 * Tooltips display informative text when users hover over, focus on, or tap an element.
 */
export const Tooltip = (props: EnhancedTooltipProps) => {
  return (
    <_Tooltip
      data-qa-tooltip={props['data-qa-tooltip'] || props.title}
      {...props}
    />
  );
};
export { tooltipClasses };
export type { TooltipProps };
