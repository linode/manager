/* eslint-disable react/jsx-no-useless-fragment */
import { StyledActionButton } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { TanstackLink } from '../TanstackLinks';

import type { TanStackLinkRoutingProps } from '../TanstackLinks';

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
  /** Optional use the tanstackRouter */
  tanstackRouter?: TanStackLinkRoutingProps;
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
    tanstackRouter,
    tooltip,
    tooltipAnalyticsEvent,
    ...rest
  } = props;

  if (href && !tanstackRouter?.to) {
    return (
      <StyledLink className={className} to={href}>
        <span>{actionText}</span>
      </StyledLink>
    );
  }

  const commonProps = {
    disabled,
    loading,
    sx: buttonHeight !== undefined ? { height: buttonHeight } : {},
    tooltipAnalyticsEvent,
    tooltipText: tooltip,
    ...rest,
  };

  return tanstackRouter?.to ? (
    <TanstackLink
      {...tanstackRouter}
      {...commonProps}
      style={{ paddingLeft: 8, paddingRight: 8 }}
      sx={{ mr: 0.5 }}
    >
      {actionText}
    </TanstackLink>
  ) : (
    <StyledActionButton {...commonProps} onClick={onClick}>
      {actionText}
    </StyledActionButton>
  );
};

const StyledLink = styled(Link)(() => ({
  paddingRight: '15px',
}));
