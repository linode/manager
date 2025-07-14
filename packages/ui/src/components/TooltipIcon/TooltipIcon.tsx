import styled from '@emotion/styled';
import { SvgIcon, useTheme } from '@mui/material';
import * as React from 'react';
import type { JSX } from 'react';

import InfoOutlined from '../../assets/icons/info-outlined.svg';
import WarningOutlined from '../../assets/icons/warning.svg';
import { omittedProps } from '../../utilities';
import { IconButton } from '../IconButton';
import { Tooltip, tooltipClasses } from '../Tooltip';

import type { TooltipProps } from '../Tooltip';
import type { SxProps, Theme } from '@mui/material/styles';

export type TooltipIconStatus = 'info' | 'warning';

interface EnhancedTooltipProps extends TooltipProps {
  width?: number;
}

type TooltipIconWithStatus = {
  icon?: never;
  status: TooltipIconStatus;
};

type TooltipIconWithCustomIcon = {
  icon: JSX.Element;
  status?: never;
};

export interface TooltipIconBaseProps
  extends Omit<
    TooltipProps,
    'children' | 'disableInteractive' | 'leaveDelay' | 'title'
  > {
  /**
   * An optional className that does absolutely nothing
   */
  className?: string;
  /**
   * An optional data-testid
   */
  dataTestId?: string;
  /**
   * Size of the tooltip icon
   * @default small
   */
  labelTooltipIconSize?: 'large' | 'small';
  /**
   * Enables a leaveDelay of 3000ms
   * @default false
   */
  leaveDelay?: number;
  /**
   * Pass specific styles to the Tooltip
   */
  sx?: SxProps<Theme>;
  /**
   * Pass specific CSS styling for the SVG icon.
   */
  sxTooltipIcon?: SxProps<Theme>;
  /**
   * The tooltip's contents
   */
  text: JSX.Element | string;
  /**
   * Send event analytics
   */
  tooltipAnalyticsEvent?: () => void;
  /**
   * Tooltip placement
   * @default 'bottom'
   */
  tooltipPosition?: TooltipProps['placement'];
  /**
   * Allows for a custom width to be set on the tooltip
   */
  width?: number;
}

export type TooltipIconProps = TooltipIconBaseProps &
  (TooltipIconWithCustomIcon | TooltipIconWithStatus);
/**
 * ## Usage
 *
 * Tooltips can be attached to any active element (text fields, buttons, etc.) on a page. They provide descriptions or explanations for their paired elements. Thus, tooltips are highly contextual and specific and don’t explain the bigger picture or entire task flow.
 *
 * **Guidelines**
 * - Don’t use tooltips for information that is vital to task completion.
 * - Provide brief and helpful content inside the tooltip.
 * - Support _both_ mouse _and_ keyboard hover.
 * - Present a link to additional content if needed.
 */
export const TooltipIcon = (props: TooltipIconProps) => {
  const theme = useTheme();

  const {
    dataTestId,
    className,
    classes,
    leaveDelay,
    icon,
    status,
    sxTooltipIcon,
    text,
    tooltipAnalyticsEvent,
    tooltipPosition,
    width,
    labelTooltipIconSize,
  } = props;

  const handleOpenTooltip = () => {
    if (tooltipAnalyticsEvent) {
      tooltipAnalyticsEvent();
    }
  };

  let renderIcon: JSX.Element | null;

  const cdsIconProps = {
    rootStyle: {
      color: theme.tokens.alias.Content.Icon.Secondary.Default,
      height: labelTooltipIconSize === 'small' ? 16 : 20,
      width: labelTooltipIconSize === 'small' ? 16 : 20,
      '&:hover': {
        color: theme.tokens.alias.Content.Icon.Primary.Hover,
      },
    },
    viewBox: '0 0 20 20',
  };

  switch (status) {
    case 'info':
      renderIcon = (
        <SvgIcon
          component={InfoOutlined}
          data-testid="tooltip-info-icon"
          sx={cdsIconProps.rootStyle}
          viewBox="0 0 24 24"
        />
      );
      break;
    case 'warning':
      renderIcon = (
        <SvgIcon
          component={WarningOutlined}
          data-testid="tooltip-warning-icon"
          sx={cdsIconProps.rootStyle}
          viewBox={cdsIconProps.viewBox}
        />
      );
      break;
    default:
      renderIcon = icon ?? null;
  }

  return (
    <StyledTooltip
      classes={classes}
      componentsProps={props.componentsProps}
      data-qa-help-tooltip
      data-testid={dataTestId}
      enterTouchDelay={0}
      leaveDelay={leaveDelay ? 3000 : undefined}
      leaveTouchDelay={5000}
      onOpen={handleOpenTooltip}
      placement={tooltipPosition ? tooltipPosition : 'bottom'}
      sx={{
        ...sxTooltipIcon,
        '&:hover': {
          color: theme.tokens.alias.Content.Icon.Primary.Hover,
        },
      }}
      title={text}
      width={width}
    >
      <IconButton
        className={className}
        data-qa-help-button
        onClick={(e) => {
          // This prevents unwanted behavior when clicking a tooltip icon.
          // See https://github.com/linode/manager/pull/10331#pullrequestreview-1971338778
          e.stopPropagation();
        }}
        size="large"
        sx={{
          ...sxTooltipIcon,
        }}
      >
        {renderIcon}
      </IconButton>
    </StyledTooltip>
  );
};

const StyledTooltip = styled(
  ({ className, ...props }: EnhancedTooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ),
  {
    label: 'StyledTooltip',
    shouldForwardProp: omittedProps(['width']),
  },
)`
  & .${tooltipClasses.tooltip} {
    max-width: ${(props) => (props.width ? props.width + 'px' : undefined)};
  }
`;
