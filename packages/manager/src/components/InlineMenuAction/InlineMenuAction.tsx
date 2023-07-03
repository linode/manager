/* eslint-disable react/jsx-no-useless-fragment */
import * as React from 'react';
import { Link } from 'react-router-dom';
import { StyledActionButton } from 'src/components/Button/StyledActionButton';
import { styled } from '@mui/material/styles';

interface InlineMenuActionProps {
  /** Required action text */
  actionText: string;
  /** Optional class names */
  className?: string;
  /** Optional href */
  href?: string;
  /** Optional disabled */
  disabled?: boolean;
  /** Optional tooltip text for help icon */
  tooltip?: string;
  /** Optional onClick handler */
  onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  /** Optional loading state */
  loading?: boolean;
  /** Optional tooltip event handler for sending analytics */
  tooltipAnalyticsEvent?: () => void;
}

export const InlineMenuAction = (props: InlineMenuActionProps) => {
  const {
    actionText,
    className,
    href,
    disabled,
    tooltip,
    onClick,
    loading,
    tooltipAnalyticsEvent,
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
      buttonType="secondary"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      tooltipText={tooltip}
      tooltipAnalyticsEvent={tooltipAnalyticsEvent}
    >
      {actionText}
    </StyledActionButton>
  );
};

const StyledLink = styled(Link)(() => ({
  paddingRight: '15px',
}));
