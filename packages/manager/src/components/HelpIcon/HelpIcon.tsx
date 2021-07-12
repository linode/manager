import * as React from 'react';
import HelpOutline from '@material-ui/icons/HelpOutline';
import ErrorOutline from '@material-ui/icons/ErrorOutline';
import IconButton from 'src/components/core/IconButton';
import Tooltip, { TooltipProps } from 'src/components/core/Tooltip';

interface Props
  extends Omit<TooltipProps, 'leaveDelay' | 'title' | 'children'> {
  text: string | JSX.Element;
  className?: string;
  interactive?: boolean;
  isError?: boolean;
  size?: number;
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

const HelpIcon: React.FC<CombinedProps> = (props) => {
  const {
    text,
    className,
    tooltipPosition,
    interactive,
    isError,
    size = 24,
    leaveDelay,
    classes,
  } = props;

  return (
    <Tooltip
      title={text}
      data-qa-help-tooltip
      enterTouchDelay={0}
      leaveTouchDelay={5000}
      leaveDelay={leaveDelay ? 3000 : undefined}
      interactive={interactive}
      placement={tooltipPosition ? tooltipPosition : 'bottom'}
      classes={classes}
    >
      <IconButton className={className} data-qa-help-button>
        {isError ? (
          <ErrorOutline
            style={{
              fontSize: size,
            }}
          />
        ) : (
          <HelpOutline />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default HelpIcon;
