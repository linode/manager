import HelpOutline from '@mui/icons-material/HelpOutline';
import _Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { omittedProps } from '../../utilities';
import { Tooltip, TooltipProps } from '../Tooltip';

import type { ButtonProps as _ButtonProps } from '@mui/material/Button';
import type { SxProps, Theme } from '@mui/material/styles';

export type ButtonType = 'outlined' | 'primary' | 'secondary';

const buttonTypeToColor: Record<ButtonType, _ButtonProps['color']> = {
  outlined: 'secondary', // We're treating this as a secondary
  primary: 'primary',
  secondary: 'secondary',
} as const;

const buttonTypeToVariant: Record<ButtonType, _ButtonProps['variant']> = {
  outlined: 'outlined',
  primary: 'contained',
  secondary: 'contained',
} as const;

export interface ButtonProps extends _ButtonProps {
  /**
   * Determines if tooltip for button should always be shown
   */
  alwaysShowTooltip?: boolean;
  /**
   * The button variant to render
   * * @default 'secondary'
   * */
  buttonType?: ButtonType;
  /**
   * Reduce the padding on the x-axis
   * @default false
   */
  compactX?: boolean;
  /**
   * Reduce the padding on the y-axis
   * @default false
   */
  compactY?: boolean;
  /**
   * Optional test ID
   */
  'data-testid'?: string;
  /** Pass specific CSS styling for the SVG icon. */
  sxEndIcon?: SxProps<Theme>;
  /** Tooltip analytics event */
  tooltipAnalyticsEvent?: () => void;
  /** Tooltip text */
  tooltipText?: string | JSX.Element;
  /**
   * Optional props passed to the tooltip
   */
  TooltipProps?: Partial<TooltipProps>;
}

const StyledButton = styled(_Button, {
  shouldForwardProp: omittedProps(['compactX', 'compactY', 'buttonType']),
})<ButtonProps>(({ compactX, compactY }) => ({
  ...(compactX && {
    minWidth: 50,
    paddingLeft: 0,
    paddingRight: 0,
  }),
  ...(compactY && {
    minHeight: 20,
    paddingBottom: 0,
    paddingTop: 0,
  }),
}));

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      alwaysShowTooltip,
      // default to secondary as some components never define a buttonType (usually buttons with icons)
      // and we end up with the wrong styles (purple color, see #6455)
      // It would be nice to remove this default and require the prop but this fixes the issue for now.
      buttonType = 'secondary',
      color,
      disabled,
      sxEndIcon,
      tooltipAnalyticsEvent,
      tooltipText,
      TooltipProps,
      ...rest
    },
    ref
  ) => {
    const showTooltip = alwaysShowTooltip || (disabled && Boolean(tooltipText));

    const handleTooltipAnalytics = () => {
      if (tooltipAnalyticsEvent) {
        tooltipAnalyticsEvent();
      }
    };

    const handleDisabledKeyDown = (e: React.KeyboardEvent) => {
      // Disable the buttom from submitting forms when disabled
      // Allow the user to tab to the button and press
      // space or enter to trigger the tooltip.
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleTooltipAnalytics();
      }
    };

    const button = (
      <StyledButton
        {...rest}
        aria-describedby={
          showTooltip ? 'button-tooltip' : rest['aria-describedby']
        }
        endIcon={
          (showTooltip && <HelpOutline sx={sxEndIcon} />) || rest.endIcon
        }
        aria-disabled={disabled}
        buttonType={buttonType}
        color={(color === 'error' && color) || buttonTypeToColor[buttonType]}
        data-testid={rest['data-testid'] || 'button'}
        disableRipple={disabled || rest.disableRipple}
        onClick={disabled ? (e) => e.preventDefault() : rest.onClick}
        onKeyDown={disabled ? handleDisabledKeyDown : rest.onKeyDown}
        ref={ref}
        variant={buttonTypeToVariant[buttonType] || 'text'}
      />
    );

    if (showTooltip) {
      return (
        <Tooltip
          aria-label={rest['aria-label']}
          data-testid="Tooltip"
          id="button-tooltip"
          onClick={handleTooltipAnalytics}
          title={tooltipText}
          {...TooltipProps}
        >
          {button}
        </Tooltip>
      );
    }

    return button;
  }
);
