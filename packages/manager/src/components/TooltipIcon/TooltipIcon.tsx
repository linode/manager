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

type TooltipIconStatus =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'help'
  | 'other';

interface Props
  extends Omit<TooltipProps, 'leaveDelay' | 'title' | 'children'> {
  sx?: SxProps;
  sxTooltipIcon?: SxProps;
  text: string | JSX.Element;
  icon?: JSX.Element;
  className?: string;
  interactive?: boolean;
  status: TooltipIconStatus;
  leaveDelay?: boolean;
  tooltipPosition?: TooltipProps['placement'];
  tooltipGAEvent?: () => void;
}

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

  const sxRootStyle = {
    height: 20,
    width: 20,
    color: '#888f91',
    '&:hover': {
      color: '#3683dc',
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
