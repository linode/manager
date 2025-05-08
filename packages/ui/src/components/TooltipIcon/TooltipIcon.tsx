import styled from '@emotion/styled';
import { SvgIcon, useTheme } from '@mui/material';
import * as React from 'react';

import InfoOutline from '../../assets/icons/info-outlined.svg';
import { omittedProps } from '../../utilities';
import { IconButton } from '../IconButton';
import { Tooltip, tooltipClasses } from '../Tooltip';

import type { TooltipProps } from '../Tooltip';
import type { SxProps, Theme } from '@mui/material/styles';

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
    leaveDelay,
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

  const cdsIconProps = {
    rootStyle: {
      color: theme.tokens.alias.Content.Icon.Primary.Default,
      '&:hover': {
        color: theme.tokens.alias.Content.Icon.Primary.Hover,
      },
      height: labelTooltipIconSize === 'small' ? 16 : 20,
      width: labelTooltipIconSize === 'small' ? 16 : 20,
    },
    viewBox: '0 0 20 20',
  };

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
        <SvgIcon
          component={InfoOutline}
          sx={cdsIconProps.rootStyle}
          viewBox={cdsIconProps.viewBox}
        />
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
