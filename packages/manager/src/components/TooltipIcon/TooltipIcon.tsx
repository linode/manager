import SuccessOutline from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import WarningOutline from '@mui/icons-material/WarningAmberOutlined';
import InfoOutline from '@mui/icons-material/InfoOutlined';
import HelpOutline from '@mui/icons-material/HelpOutline';
import * as React from 'react';
import IconButton from 'src/components/core/IconButton';
import Tooltip, { TooltipProps } from 'src/components/core/Tooltip';
import { SxProps } from '@mui/system';
import { useTheme } from '@mui/material/styles';

export const TOOLTIP_ICON_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  HELP: 'help',
} as const;

export type ObjectValues<T> = T[keyof T];

export type TooltipIconStatus = ObjectValues<typeof TOOLTIP_ICON_STATUS>;

interface Props
  extends Omit<TooltipProps, 'leaveDelay' | 'title' | 'children'> {
  sx?: SxProps;
  sxTooltipIcon?: SxProps;
  text: string | JSX.Element;
  className?: string;
  interactive?: boolean;
  status: TooltipIconStatus;
  leaveDelay?: boolean;
  tooltipPosition?: TooltipProps['placement'];
  tooltipGAEvent?: () => void;
}

const TooltipIcon = (props: Props) => {
  const theme = useTheme();

  const {
    classes,
    text,
    tooltipPosition,
    interactive,
    status,
    leaveDelay,
    tooltipGAEvent,
    sx,
    sxTooltipIcon,
  } = props;

  const handleOpenTooltip = () => {
    if (tooltipGAEvent) {
      tooltipGAEvent();
    }
  };

  let renderIcon: JSX.Element | null = null;

  switch (status) {
    case 'success':
      renderIcon = (
        <SuccessOutline style={{ color: theme.color.blueDTwhite }} />
      );
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
      renderIcon = <HelpOutline style={{ height: 20, width: 20 }} />;
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

export default TooltipIcon;
