import HelpOutline from '@mui/icons-material/HelpOutline';
import _Button, { ButtonProps as _ButtonProps } from '@mui/material/Button';
import { Theme, styled } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import * as React from 'react';

import Reload from 'src/assets/icons/reload.svg';
import { Tooltip } from 'src/components/Tooltip';

import { rotate360 } from '../../styles/keyframes';
import { omittedProps } from '../../utilities/omittedProps';

export type ButtonType = 'outlined' | 'primary' | 'secondary';

export interface ButtonProps extends _ButtonProps {
  /**
   * The button variant to render
   * * @default 'secondary'
   * */
  buttonType?: ButtonType;
  /** Additional css class to pass to the component */
  className?: string;
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
   * Show a loading indicator
   * @default false
   */
  loading?: boolean;
  /** The `sx` prop can be either object or function */
  sx?: SxProps<Theme>;
  /** Pass specific CSS styling for the SVG icon. */
  sxEndIcon?: SxProps<Theme>;
  /** Tooltip analytics event */
  tooltipAnalyticsEvent?: () => void;
  /** Tooltip text */
  tooltipText?: string;
}

const StyledButton = styled(_Button, {
  shouldForwardProp: omittedProps([
    'compactX',
    'compactY',
    'loading',
    'buttonType',
  ]),
})<ButtonProps>(({ theme, ...props }) => ({
  ...(props.buttonType === 'secondary' && {
    color: theme.textColors.linkActiveLight,
  }),
  ...(props.compactX && {
    minWidth: 50,
    paddingLeft: 0,
    paddingRight: 0,
  }),
  ...(props.compactY && {
    minHeight: 20,
    paddingBottom: 0,
    paddingTop: 0,
  }),
  ...(props.loading && {
    '& svg': {
      animation: `${rotate360} 2s linear infinite`,
      height: `${theme.spacing(2)}`,
      margin: '0 auto',
      width: `${theme.spacing(2)}`,
    },
    '&:disabled': {
      backgroundColor:
        props.buttonType === 'primary' && theme.palette.text.primary,
    },
  }),
}));

const Span = styled('span')({
  '@supports (-moz-appearance: none)': {
    /* Fix text alignment for Firefox */
    marginTop: 2,
  },
  alignItems: 'center',
  display: 'flex',
});

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      // default to secondary as some components never define a buttonType (usually buttons with icons)
      // and we end up with the wrong styles (purple color, see #6455)
      // It would be nice to remove this default and require the prop but this fixes the issue for now.
      buttonType = 'secondary',
      children,
      className,
      compactX,
      compactY,
      disabled,
      loading,
      sx,
      sxEndIcon,
      tooltipAnalyticsEvent,
      tooltipText,
      ...rest
    },
    ref
  ) => {
    const color = buttonType === 'primary' ? 'primary' : 'secondary';
    const showTooltip = disabled && Boolean(tooltipText);

    const variant =
      buttonType === 'primary' || buttonType === 'secondary'
        ? 'contained'
        : buttonType === 'outlined'
        ? 'outlined'
        : 'text';

    const handleTooltipAnalytics = () => {
      if (tooltipAnalyticsEvent) {
        tooltipAnalyticsEvent();
      }
    };

    const renderButton = (
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
        className={className}
        color={color}
        compactX={compactX}
        compactY={compactY}
        data-testid={rest['data-testid'] || 'Button'}
        disableRipple={disabled}
        disabled={loading}
        loading={loading}
        onClick={disabled ? (e) => e.preventDefault() : rest.onClick}
        onKeyDown={disabled ? (e) => e.preventDefault() : rest.onKeyDown}
        ref={ref}
        sx={sx}
        variant={variant}
      >
        <Span data-testid="loadingIcon">{loading ? <Reload /> : children}</Span>
      </StyledButton>
    );

    return showTooltip ? (
      <Tooltip
        data-testid="Tooltip"
        id="button-tooltip"
        onClick={handleTooltipAnalytics}
        title={tooltipText}
      >
        {renderButton}
      </Tooltip>
    ) : (
      renderButton
    );
  }
);
