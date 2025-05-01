import { Tooltip, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import type { TypographyProps } from '@linode/ui';
import type { SxProps, Theme } from '@mui/material';
import type { TooltipProps } from '@mui/material/Tooltip';

export interface TextTooltipProps {
  /**
   * The data-qa-tooltip attribute for the tooltip.
   * Defaults to the tooltip title, but will be undefined if the title is a JSX element.
   */
  dataQaTooltip?: string;
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
  /**
   * Props to pass to the Popper component
   */
  PopperProps?: TooltipProps['PopperProps'];
  /** Optional custom styles */
  sxTypography?: SxProps<Theme>;
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
    PopperProps,
    dataQaTooltip,
    displayText,
    minWidth,
    placement,
    sxTypography,
    tooltipText,
    variant = 'body1',
  } = props;

  return (
    <StyledRootTooltip
      data-qa-tooltip={dataQaTooltip}
      enterTouchDelay={0}
      placement={placement ? placement : 'bottom'}
      PopperProps={{
        ...PopperProps,
        sx: {
          ...PopperProps?.sx,
          '& > div': {
            minWidth: minWidth ? minWidth : 375,
          },
        },
      }}
      tabIndex={0}
      title={tooltipText}
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
  '&:hover': {
    color: theme.textColors.linkHover,
  },
  borderRadius: 4,
  color: theme.textColors.linkActiveLight,
  cursor: 'pointer',
  position: 'relative',
  textDecoration: `underline dotted ${theme.textColors.linkActiveLight}`,
  textUnderlineOffset: 4,
}));
