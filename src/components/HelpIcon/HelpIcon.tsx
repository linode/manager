import HelpOutline from '@material-ui/icons/HelpOutline';
import * as React from 'react';
import IconButton from 'src/components/core/IconButton';
import Tooltip from 'src/components/core/Tooltip';

interface Props {
  text: string;
  className?: string;
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
  const { text, className, tooltipPosition } = props;

  return (
    <React.Fragment>
      <Tooltip
        title={text}
        data-qa-help-tooltip
        enterTouchDelay={0}
        leaveTouchDelay={5000}
        placement={tooltipPosition ? tooltipPosition : 'bottom'}
      >
        <IconButton className={className} data-qa-help-button>
          <HelpOutline />
        </IconButton>
      </Tooltip>
    </React.Fragment>
  );
};

export default HelpIcon;
