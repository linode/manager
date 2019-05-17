import Cached from '@material-ui/icons/Cached';
import * as React from 'react';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import { linodeInTransition } from 'src/features/linodes/transitions';

interface Props {
  status: Linode.LinodeStatus | 'loading';
  recentEvent?: Linode.Event;
}

type CSSClasses = 'grey' | 'dot' | 'green' | 'red' | 'transition';

const styles: StyleRulesCallback<CSSClasses> = theme => ({
  '@keyframes rotate': {
    from: {
      transform: 'rotate(0deg)'
    },
    to: {
      transform: 'rotate(360deg)'
    }
  },
  dot: {
    fontSize: '1.5rem',
    userSelect: 'none'
  },
  transition: {
    position: 'relative',
    top: 1,
    left: -1,
    '& svg': {
      animation: 'rotate 2s linear infinite',
      fill: theme.color.offBlack
    }
  },
  green: {
    color: '#01b159'
  },
  red: {
    color: '#d01e1e'
  },
  grey: {
    color: '#efefef'
  }
});

const LinodeStatusIndicator = (props: Props & WithStyles<CSSClasses>) => {
  const { classes, status } = props;
  return (
    <React.Fragment>
      {status === 'loading' && (
        <span
          className={`${classes.dot} ${classes.grey}`}
          data-qa-status={status}
        >
          &#x25CF;
        </span>
      )}
      {status === 'running' && (
        <span
          className={`${classes.dot} ${classes.green}`}
          data-qa-status={status}
        >
          &#x25CF;
        </span>
      )}
      {status === 'offline' && (
        <span
          className={`${classes.dot} ${classes.red}`}
          data-qa-status={status}
        >
          &#x25CF;
        </span>
      )}
      {linodeInTransition(status, props.recentEvent) && (
        <span className={`${classes.transition}`} data-qa-status={status}>
          <Cached style={{ fontSize: '1.0rem' }} />
        </span>
      )}
    </React.Fragment>
  );
};

const styled = withStyles(styles);

export default styled(LinodeStatusIndicator);
