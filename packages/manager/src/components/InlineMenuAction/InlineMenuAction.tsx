/* eslint-disable react/jsx-no-useless-fragment */
import * as React from 'react';
import { Link } from 'react-router-dom';
import Button from 'src/components/Button/Button';
import { styled } from '@mui/material/styles';
import { latoWeb } from 'src/foundations/fonts';

interface InlineMenuActionProps {
  actionText: string;
  className?: string;
  href?: string;
  disabled?: boolean;
  tooltip?: string;
  loading?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
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
  } else {
    return (
      <Button
        buttonType="secondary"
        onClick={onClick}
        disabled={disabled}
        loading={loading}
        tooltipText={tooltip}
        tooltipAnalyticsEvent={tooltipAnalyticsEvent}
        compactX
        sx={{
          // TODO: We need to better define our button guidelines for this type of usage
          fontFamily: latoWeb.normal,
          fontSize: '14px',
          padding: '12px 10px',
        }}
      >
        {actionText}
      </Button>
    );
  }
};

const StyledLink = styled(Link)(() => ({
  paddingRight: '15px',
}));
