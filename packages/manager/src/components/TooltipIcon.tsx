import styled from '@emotion/styled';
import SuccessOutline from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import HelpOutline from '@mui/icons-material/HelpOutline';
import InfoOutline from '@mui/icons-material/InfoOutlined';
import WarningOutline from '@mui/icons-material/WarningAmberOutlined';
import { useTheme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import * as React from 'react';

import { IconButton } from 'src/components/IconButton';
import { Tooltip, TooltipProps, tooltipClasses } from 'src/components/Tooltip';
import { omittedProps } from 'src/utilities/omittedProps';

type TooltipIconStatus =
  | 'error'
  | 'help'
  | 'info'
  | 'other'
  | 'success'
  | 'warning';

type EnhancedTooltipProps = TooltipProps & { width?: number };

export interface TooltipIconProps
  extends Omit<TooltipProps, 'children' | 'leaveDelay' | 'title'> {
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
   * Makes the tooltip interactive (stays open when cursor is over tooltip)
   * @default false
   */
  interactive?: boolean;
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
  sx?: SxProps;
  /**
   * Pass specific CSS styling for the SVG icon.
   */
  sxTooltipIcon?: SxProps;
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
    interactive,
    leaveDelay,
    status,
    sx,
    sxTooltipIcon,
    text,
    tooltipAnalyticsEvent,
    tooltipPosition,
    width,
  } = props;

  const handleOpenTooltip = () => {
    if (tooltipAnalyticsEvent) {
      tooltipAnalyticsEvent();
    }
  };

  let renderIcon: JSX.Element | null = null;

  const sxRootStyle = {
    '&&': {
      fill: '#888f91',
      stroke: '#888f91',
      strokeWidth: 0,
    },
    '&:hover': {
      color: '#3683dc',
      fill: '#3683dc',
      stroke: '#3683dc',
    },
    color: '#888f91',
    height: 20,
    width: 20,
  };

  switch (status) {
    case 'success':
      renderIcon = <SuccessOutline style={{ color: theme.color.blue }} />;
      break;
    case 'error':
      renderIcon = <ErrorOutline style={{ color: theme.color.red }} />;
      break;
    case 'warning':
      renderIcon = <WarningOutline style={{ color: theme.color.yellow }} />;
      break;
    case 'info':
      renderIcon = <InfoOutline style={{ color: theme.color.black }} />;
      break;
    case 'help':
      renderIcon = <HelpOutline sx={sxRootStyle} />;
      break;
    case 'other':
      renderIcon = icon ?? null;
      break;
    default:
      renderIcon = null;
  }

  return (
    <StyledTooltip
      classes={classes}
      componentsProps={props.componentsProps}
      data-qa-help-tooltip
      disableInteractive={!interactive}
      enterTouchDelay={0}
      leaveDelay={leaveDelay ? 3000 : undefined}
      leaveTouchDelay={5000}
      onOpen={handleOpenTooltip}
      placement={tooltipPosition ? tooltipPosition : 'bottom'}
      sx={sx}
      title={text}
      width={width}
    >
      <IconButton data-qa-help-button size="large" sx={sxTooltipIcon}>
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
  }
)`
  & .${tooltipClasses.tooltip} {
    max-width: ${(props) => (props.width ? props.width + 'px' : undefined)};
  }
`;
