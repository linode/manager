/* eslint-disable react/jsx-no-useless-fragment */
import { StyledActionButton } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';

interface InlineMenuActionProps {
  /** Required action text */
  actionText: string;
  /** Optional aria label */
  'aria-label'?: string;
  /** Optional height when displayed as a button */
  buttonHeight?: number;
  /** Optional class names */
  className?: string;
  /** Optional test id */
  'data-testid'?: string;
  /** Optional disabled */
  disabled?: boolean;
  /** Optional href */
  href?: string;
  /** Optional loading state */
  loading?: boolean;
  /** Optional onClick handler */
  onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  /** Optional tooltip text for help icon */
  tooltip?: string;
  /** Optional tooltip event handler for sending analytics */
  tooltipAnalyticsEvent?: () => void;
}

export const InlineMenuAction = (props: InlineMenuActionProps) => {
  const {
    actionText,
    buttonHeight,
    className,
    disabled,
    href,
    loading,
    onClick,
    tooltip,
    tooltipAnalyticsEvent,
    ...rest
  } = props;

  if (href) {
    return (
      <StyledLink className={className} to={href}>
        <span>{actionText}</span>
      </StyledLink>
    );
  }

  return (
    <StyledActionButton
      // TODO: We need to define what buttonType this will be in the future for now 'secondary' works...
      buttonType="primary"
      disabled={disabled}
      loading={loading}
      onClick={onClick}
      sx={buttonHeight !== undefined ? { height: buttonHeight } : {}}
      tooltipAnalyticsEvent={tooltipAnalyticsEvent}
      tooltipText={tooltip}
      {...rest}
    >
      {actionText}
    </StyledActionButton>
  );
};

const StyledLink = styled(Link)(() => ({
  paddingRight: '15px',
}));
