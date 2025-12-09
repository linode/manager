import { default as _Tooltip, tooltipClasses } from '@mui/material/Tooltip';
import React from 'react';

import type { TooltipProps } from '@mui/material/Tooltip';

/**
 * Tooltips display informative text when users hover over, focus on, or tap an element.
 */
export const Tooltip = (props: TooltipProps) => {
  // Avoiding displaying [object Object] in the data-qa-tooltip attribute when the title is an JSX element.
  // Can be overridden by passing data-qa-tooltip directly to the Tooltip component.
  const dataQaTooltip: string | undefined =
    typeof props.title === 'string' ? props.title : undefined;

  return <_Tooltip data-qa-tooltip={dataQaTooltip} {...props} />;
};
export { tooltipClasses };
export type { TooltipProps };
