import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Tooltip } from 'src/components/Tooltip';
import { Typography } from 'src/components/Typography';

import type { SxProps } from '@mui/material';
import type { TooltipProps } from '@mui/material/Tooltip';
import type { TypographyProps } from 'src/components/Typography';

export interface TextTooltipProps {
  /** The text to hover on to display the tooltip */
  displayText: string;
  /** If true, the tooltip will not have a min-width of 375px
   * @default 375
   */
  minWidth?: number | string;
  /**
   * The placement of the tooltip
   * @default bottom
   */
  placement?: TooltipProps['placement'];
  /** Optional custom styles */
  sxTypography?: SxProps;
  /** The text to display inside the tooltip */
  tooltipText: JSX.Element | string;
  /**
   * Optional variant override for the Typography
   * @default body1
   */
  variant?: TypographyProps['variant'];
}

/**
 * Dotted underline copy with a tooltip on hover
 */
export const TextTooltip = (props: TextTooltipProps) => {
  const {
    displayText,
    minWidth,
    placement,
    sxTypography,
    tooltipText,
    variant = 'body1',
  } = props;

  return (
    <StyledRootTooltip
      PopperProps={{
        sx: {
          '& > div': {
            minWidth: minWidth ? minWidth : 375,
          },
        },
      }}
      enterTouchDelay={0}
      placement={placement ? placement : 'bottom'}
      title={tooltipText}
      leaveDelay={1000000}
    >
      <Typography component="span" sx={sxTypography} variant={variant}>
        {displayText}
      </Typography>
    </StyledRootTooltip>
  );
};

const StyledRootTooltip = styled(Tooltip, {
  label: 'StyledRootTooltip',
})(({ theme }) => ({
  borderRadius: 4,
  color: theme.palette.primary.main,
  cursor: 'pointer',
  position: 'relative',
  textDecoration: `underline dotted ${theme.palette.primary.main}`,
  textUnderlineOffset: 4,
}));
