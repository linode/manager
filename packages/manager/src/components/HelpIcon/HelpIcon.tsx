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

type NoticeIconStatus = 'success' | 'error' | 'warning' | 'info' | 'help';

interface Props
  extends Omit<TooltipProps, 'leaveDelay' | 'title' | 'children'> {
  sx?: SxProps;
  text: string | JSX.Element;
  className?: string;
  interactive?: boolean;
  noticeIconStatus: NoticeIconStatus;
  leaveDelay?: boolean;
  tooltipPosition?: TooltipProps['placement'];
  tooltipGAEvent?: () => void;
}

type CombinedProps = Props;

const HelpIcon: React.FC<CombinedProps> = (props) => {
  const theme = useTheme();

  const {
    text,
    tooltipPosition,
    interactive,
    noticeIconStatus,
    leaveDelay,
    tooltipGAEvent,
    sx,
  } = props;

  const handleOpenTooltip = () => {
    if (tooltipGAEvent) {
      tooltipGAEvent();
    }
  };

  let renderIcon: JSX.Element | null = null;

  switch (noticeIconStatus) {
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
      title={text}
      data-qa-help-tooltip
      enterTouchDelay={0}
      leaveTouchDelay={5000}
      leaveDelay={leaveDelay ? 3000 : undefined}
      disableInteractive={!interactive}
      placement={tooltipPosition ? tooltipPosition : 'bottom'}
      onOpen={handleOpenTooltip}
    >
      <IconButton data-qa-help-button size="large">
        {renderIcon}
      </IconButton>
    </Tooltip>
  );
};

export default HelpIcon;
