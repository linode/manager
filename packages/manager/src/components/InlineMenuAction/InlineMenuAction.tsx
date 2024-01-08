/* eslint-disable react/jsx-no-useless-fragment */
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { StyledActionButton } from 'src/components/Button/StyledActionButton';

interface InlineMenuActionProps {
  /** Required action text */
  actionText: string;
  /** Optional class names */
  className?: string;
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
      aria-label={rest['aria-label']}
      buttonType="secondary"
      disabled={disabled}
      loading={loading}
      onClick={onClick}
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
