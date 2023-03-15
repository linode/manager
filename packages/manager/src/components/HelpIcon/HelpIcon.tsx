import ErrorOutline from '@mui/icons-material/ErrorOutline';
import HelpOutline from '@mui/icons-material/HelpOutline';
import * as React from 'react';
import IconButton from 'src/components/core/IconButton';
import { makeStyles } from '@mui/styles';
import Tooltip, { TooltipProps } from 'src/components/core/Tooltip';
import { SxProps } from '@mui/system';

const useStyles = makeStyles(() => ({
  root: {
    color: '#888f91',
    '&:hover': {
      color: '#3683dc',
    },
    '& svg': {
      height: 20,
      width: 20,
    },
  },
}));

interface Props
  extends Omit<TooltipProps, 'leaveDelay' | 'title' | 'children'> {
  sx?: SxProps;
  text: string | JSX.Element;
  className?: string;
  interactive?: boolean;
  isError?: boolean;
  classes?: any;
  leaveDelay?: boolean;
  tooltipPosition?:
    | 'bottom'
    | 'bottom-end'
    | 'bottom-start'
    | 'left-end'
    | 'left-start'
    | 'left'
    | 'right-end'
    | 'right-start'
    | 'right'
    | 'top-end'
    | 'top-start'
    | 'top';
}

type CombinedProps = Props;

// @TODO: M3-5457 refactor this component to be generic
const HelpIcon: React.FC<CombinedProps> = (props) => {
  const styles = useStyles();

  const {
    text,
    className,
    tooltipPosition,
    interactive,
    isError,
    leaveDelay,
    classes,
    onMouseEnter,
    sx,
  } = props;

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
      onMouseEnter={onMouseEnter}
    >
      <IconButton
        className={`${className} ${styles.root}`}
        data-qa-help-button
        size="large"
      >
        {isError ? <ErrorOutline /> : <HelpOutline />}
      </IconButton>
    </Tooltip>
  );
};

export default HelpIcon;
