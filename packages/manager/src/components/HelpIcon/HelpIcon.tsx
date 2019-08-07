import HelpOutline from '@material-ui/icons/HelpOutline';
import * as React from 'react';
import IconButton from 'src/components/core/IconButton';
import Tooltip from 'src/components/core/Tooltip';

interface Props {
  text: string | JSX.Element;
  className?: string;
  interactive?: boolean;
  leaveDelay?: boolean;
  customClassName?: string;
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

const HelpIcon: React.StatelessComponent<CombinedProps> = props => {
  const {
    text,
    className,
    tooltipPosition,
    interactive,
    leaveDelay,
    customClassName
  } = props;

  return (
    <React.Fragment>
      <Tooltip
        title={text}
        data-qa-help-tooltip
        enterTouchDelay={0}
        leaveTouchDelay={5000}
        leaveDelay={leaveDelay ? 3000 : undefined}
        interactive={interactive && interactive}
        placement={tooltipPosition ? tooltipPosition : 'bottom'}
        classes={{ tooltip: customClassName }}
      >
        <IconButton className={className} data-qa-help-button>
          <HelpOutline />
        </IconButton>
      </Tooltip>
    </React.Fragment>
  );
};

export default HelpIcon;
