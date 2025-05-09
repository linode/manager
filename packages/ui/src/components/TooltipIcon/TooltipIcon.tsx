import styled from '@emotion/styled';
import SuccessOutline from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import HelpOutline from '@mui/icons-material/HelpOutline';
import InfoOutline from '@mui/icons-material/InfoOutlined';
import WarningSolid from '@mui/icons-material/Warning';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { omittedProps } from '../../utilities';
import { IconButton } from '../IconButton';
import { Tooltip, tooltipClasses } from '../Tooltip';

import type { TooltipProps } from '../Tooltip';
import type { SxProps, Theme } from '@mui/material/styles';

export type TooltipIconStatus =
  | 'error'
  | 'help'
  | 'info'
  | 'other'
  | 'success'
  | 'warning';

interface EnhancedTooltipProps extends TooltipProps {
  width?: number;
}

export interface TooltipIconProps
  extends Omit<
    TooltipProps,
    'children' | 'disableInteractive' | 'leaveDelay' | 'title'
  > {
  /**
   * An optional className that does absolutely nothing
   */
  className?: string;
  /**
   * Use this custom icon when `status` is `other`
   * @todo this seems like a flaw... passing an icon should not require `status` to be `other`
   */
  icon?: JSX.Element;
  /**
   * Size of the tooltip icon
   * * @default small
   */
  labelTooltipIconSize?: 'large' | 'small';
  /**
   * Enables a leaveDelay of 3000ms
   * @default false
   */
  leaveDelay?: number;
  /**
   * Sets the icon and color
   */
  status: TooltipIconStatus;
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
    classes,
    icon,
    leaveDelay,
    status,
    sx,
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

  const sxRootStyle = {
    '&&': {
      fill: theme.tokens.color.Neutrals[50],
      stroke: theme.tokens.color.Neutrals[50],
      strokeWidth: 0,
    },
    '&:hover': {
      color: theme.palette.primary.main,
      fill: theme.palette.primary.main,
      stroke: theme.palette.primary.main,
    },
    height: labelTooltipIconSize === 'small' ? 16 : 20,
    width: labelTooltipIconSize === 'small' ? 16 : 20,
  };

  switch (status) {
    case 'error':
      renderIcon = <ErrorOutline style={{ color: theme.color.red }} />;
      break;
    case 'help':
      renderIcon = <HelpOutline sx={sxRootStyle} />;
      break;
    case 'info':
      renderIcon = <InfoOutline style={{ color: theme.color.black }} />;
      break;
    case 'other':
      renderIcon = icon ?? null;
      break;
    case 'success':
      renderIcon = <SuccessOutline style={{ color: theme.color.blue }} />;
      break;
    case 'warning':
      renderIcon = <WarningSolid style={{ color: theme.color.orange }} />;
      break;
    default:
      renderIcon = null;
  }

  return (
    <StyledTooltip
      classes={classes}
      componentsProps={props.componentsProps}
      data-qa-help-tooltip
      enterTouchDelay={0}
      leaveDelay={leaveDelay ? 3000 : undefined}
      leaveTouchDelay={5000}
      onOpen={handleOpenTooltip}
      placement={tooltipPosition ? tooltipPosition : 'bottom'}
      sx={sx}
      title={text}
      width={width}
    >
      <IconButton
        data-qa-help-button
        onClick={(e) => {
          // This prevents unwanted behavior when clicking a tooltip icon.
          // See https://github.com/linode/manager/pull/10331#pullrequestreview-1971338778
          e.stopPropagation();
        }}
        size="large"
        sx={sxTooltipIcon}
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
