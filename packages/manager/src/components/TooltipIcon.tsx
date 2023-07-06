import SuccessOutline from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import WarningOutline from '@mui/icons-material/WarningAmberOutlined';
import InfoOutline from '@mui/icons-material/InfoOutlined';
import HelpOutline from '@mui/icons-material/HelpOutline';
import * as React from 'react';
import { IconButton } from 'src/components/IconButton';
import { Tooltip, TooltipProps } from 'src/components/Tooltip';
import { SxProps } from '@mui/system';
import { useTheme } from '@mui/material/styles';

type TooltipIconStatus =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'help'
  | 'other';

interface Props
  extends Omit<TooltipProps, 'leaveDelay' | 'title' | 'children'> {
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
  text: string | JSX.Element;
  /**
   * Use this custom icon when `status` is `other`
   * @todo this seems like a flaw... passing an icon should not require `status` to be `other`
   */
  icon?: JSX.Element;
  /**
   * An optional className that does absolutely nothing
   */
  className?: string;
  /**
   * Makes the tooltip interactive (stays open when cursor is over tooltip)
   * @default false
   */
  interactive?: boolean;
  /**
   * Sets the icon and color
   */
  status: TooltipIconStatus;
  /**
   * Enables a leaveDelay of 3000ms
   * @default false
   */
  leaveDelay?: boolean;
  /**
   * Tooltip placement
   * @default 'bottom'
   */
  tooltipPosition?: TooltipProps['placement'];
  /**
   * Send event analytics
   */
  tooltipAnalyticsEvent?: () => void;
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
export const TooltipIcon = (props: Props) => {
  const theme = useTheme();

  const {
    classes,
    text,
    icon,
    tooltipPosition,
    interactive,
    status,
    leaveDelay,
    tooltipAnalyticsEvent,
    sx,
    sxTooltipIcon,
  } = props;

  const handleOpenTooltip = () => {
    if (tooltipAnalyticsEvent) {
      tooltipAnalyticsEvent();
    }
  };

  let renderIcon: JSX.Element | null = null;

  const sxRootStyle = {
    height: 20,
    width: 20,
    color: '#888f91',
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
    <Tooltip
      sx={sx}
      classes={classes}
      title={text}
      data-qa-help-tooltip
      enterTouchDelay={0}
      leaveTouchDelay={5000}
      leaveDelay={leaveDelay ? 3000 : undefined}
      disableInteractive={!interactive}
      placement={tooltipPosition ? tooltipPosition : 'bottom'}
      onOpen={handleOpenTooltip}
    >
      <IconButton data-qa-help-button size="large" sx={sxTooltipIcon}>
        {renderIcon}
      </IconButton>
    </Tooltip>
  );
};
