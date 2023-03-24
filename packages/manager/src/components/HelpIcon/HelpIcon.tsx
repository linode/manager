import SuccessOutline from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import WarningOutline from '@mui/icons-material/WarningAmberOutlined';
import InfoOutline from '@mui/icons-material/InfoOutlined';
import HelpOutline from '@mui/icons-material/HelpOutline';
import * as React from 'react';
import IconButton from 'src/components/core/IconButton';
import Tooltip, { TooltipProps } from 'src/components/core/Tooltip';
import { SxProps } from '@mui/system';
import { isPropValid } from '../../utilities/isPropValid';
import { styled } from '@mui/material/styles';

// const useStyles = makeStyles((theme: Theme) => ({
//   help: {
//     color: '#888f91',
//     '&:hover': {
//       color: '#3683dc',
//     },
//     '& svg': {
//       height: 20,
//       width: 20,
//     },
//   },
//   success: {
//     color: theme.palette.success.dark,
//   },
//   error: {
//     color: theme.palette.error.dark,
//   },
//   warning: {
//     color: theme.palette.warning.dark,
//   },
//   info: {
//     color: theme.color.black,
//   },
// }));

type NoticeIconStatus = 'success' | 'error' | 'warning' | 'info' | 'help';

interface Props
  extends Omit<TooltipProps, 'leaveDelay' | 'title' | 'children'> {
  sx?: SxProps;
  text: string | JSX.Element;
  className?: string;
  interactive?: boolean;
  noticeIconStatus: NoticeIconStatus;
  classes?: any;
  leaveDelay?: boolean;
  tooltipPosition?: TooltipProps['placement'];
  tooltipGAEvent?: () => void;
  sxHelpIcon: SxProps;
}

type CombinedProps = Props;

const StyledIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => isPropValid(['noticeIconStatus'], prop),
})<CombinedProps>(({ theme, ...props }) => ({
  ...(props.noticeIconStatus === 'error' && {
    color: theme.palette.error.dark,
  }),
}));

const HelpIcon = ({
  text,
  // className,
  tooltipPosition,
  interactive,
  noticeIconStatus,
  leaveDelay,
  classes,
  tooltipGAEvent,
  sx,
  sxHelpIcon,
  ...rest
}: CombinedProps) => {
  // const theme = useTheme();

  const handleOpenTooltip = () => {
    if (tooltipGAEvent) {
      tooltipGAEvent();
    }
  };

  let renderIcon: JSX.Element | null = null;

  switch (noticeIconStatus) {
    case 'success':
      renderIcon = <SuccessOutline />;
      break;
    case 'error':
      renderIcon = <ErrorOutline />;
      break;
    case 'warning':
      renderIcon = <WarningOutline />;
      break;
    case 'info':
      renderIcon = <InfoOutline />;
      break;
    case 'help':
      renderIcon = <HelpOutline />;
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
      classes={classes}
      onOpen={handleOpenTooltip}
    >
      <StyledIconButton
        {...rest}
        data-qa-help-button
        size="large"
        // className={`${className} ${styles[noticeIconStatus]}`}
        sxHelpIcon={sxHelpIcon}
        noticeIconStatus={'error'}
      >
        {renderIcon}
      </StyledIconButton>
    </Tooltip>
  );
};

export default HelpIcon;
