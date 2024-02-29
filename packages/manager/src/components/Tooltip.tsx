import { default as _Tooltip, tooltipClasses } from '@mui/material/Tooltip';
import React from 'react';

import type { TooltipProps } from '@mui/material/Tooltip';

/**
 * Tooltips display informative text when users hover over, focus on, or tap an element.
 */
export const Tooltip = (props: TooltipProps) => {
  return <_Tooltip data-qa-tooltip={props.title} {...props} />;
};
export { tooltipClasses };
export type { TooltipProps };
