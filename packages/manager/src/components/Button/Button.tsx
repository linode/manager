import * as React from 'react';
import Reload from 'src/assets/icons/reload.svg';
import _Button, { ButtonProps } from '@mui/material/Button';
import { TooltipIcon } from 'src/components/TooltipIcon/TooltipIcon';
import { useTheme, styled, Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import { isPropValid } from '../../utilities/isPropValid';
import { rotate360 } from '../../styles/keyframes';

export type ButtonType = 'primary' | 'secondary' | 'outlined';

export interface Props extends ButtonProps {
  /** The button variant to render */
  buttonType?: ButtonType;
  /** Additional css class to pass to the component */
  className?: string;
  /** The `sx` prop can be either object or function */
  sx?: SxProps<Theme>;
  /** Reduce the padding on the x-axis */
  compactX?: boolean;
  /** Reduce the padding on the y-axis */
  compactY?: boolean;
  /** Show a loading indicator */
  loading?: boolean;
  /** Tooltip text */
  tooltipText?: string;
  /** Tooltip analytics event */
  tooltipAnalyticsEvent?: () => void;
}

const StyledButton = styled(_Button, {
  shouldForwardProp: (prop) =>
    isPropValid(['compactX', 'compactY', 'loading', 'buttonType'], prop),
})<Props>(({ theme, ...props }) => ({
  ...(props.buttonType === 'secondary' &&
    props.compactX && {
      minWidth: 50,
      paddingLeft: 0,
      paddingRight: 0,
    }),
  ...(props.buttonType === 'secondary' &&
    props.compactY && {
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

const Button = React.forwardRef<HTMLButtonElement, Props>(
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
      tooltipAnalyticsEvent,
      tooltipText,
      ...rest
    }: Props,
    ref
  ) => {
    const theme = useTheme();
    const color = buttonType === 'primary' ? 'primary' : 'secondary';
    const sxTooltipIcon = { marginLeft: `-${theme.spacing()}` };

    const variant =
      buttonType === 'primary' || buttonType === 'secondary'
        ? 'contained'
        : buttonType === 'outlined'
        ? 'outlined'
        : 'text';

    return (
      <React.Fragment>
        <StyledButton
          {...rest}
          buttonType={buttonType}
          className={className}
          color={color}
          compactX={compactX}
          compactY={compactY}
          disabled={disabled || loading}
          loading={loading}
          sx={sx}
          variant={variant}
          ref={ref}
        >
          <Span data-testid="loadingIcon">
            {loading ? <Reload /> : children}
          </Span>
        </StyledButton>
        {tooltipText && (
          <TooltipIcon
            sxTooltipIcon={sxTooltipIcon}
            text={tooltipText}
            tooltipAnalyticsEvent={tooltipAnalyticsEvent}
            status="help"
          />
        )}
      </React.Fragment>
    );
  }
);

Button.displayName = 'Button';

export default Button;
