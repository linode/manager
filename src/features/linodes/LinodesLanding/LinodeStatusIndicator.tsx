import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Cached from '@material-ui/icons/Cached';

import { linodeInTransition } from 'src/features/linodes/transitions';

interface Props {
  status: Linode.LinodeStatus | 'loading';
  recentEvent?: Linode.Event;
}

type CSSClasses = 'grey' | 'dot' | 'green' | 'red' | 'transition';

const styles: StyleRulesCallback<CSSClasses> = (theme) => ({
  '@keyframes rotate': {
    from: {
      transform: 'rotate(0deg)',
    },
    to: {
      transform: 'rotate(360deg)',
    },
  },
  dot: {
    fontSize: '1.5rem',
    userSelect: 'none',
  },
  transition: {
    marginLeft: -1,
    '& svg': {
      animation: 'rotate 2s linear infinite',
    },
  },
  green: {
    color: '#01b159',
  },
  red: {
    color: '#d01e1e',
  },
  grey: {
    color: '#efefef',
  },
});

const LinodeStatusIndicator = (props: Props & WithStyles<CSSClasses>) => {
  const { classes } = props;
  return (
    <React.Fragment>
      {props.status === 'loading' &&
        <span
          className={`${classes.dot} ${classes.grey}`}
          data-qa-status={props.status}
        >
          &#x25CF;
        </span>
      }
      {props.status === 'running' &&
        <span
          className={`${props.classes.dot} ${props.classes.green}`}
          data-qa-status={props.status}
        >
          &#x25CF;
        </span>
      }
      {props.status === 'offline' &&
        <span
          className={`${props.classes.dot} ${props.classes.red}`}
          data-qa-status={props.status}
        >
          &#x25CF;
        </span>
      }
      {linodeInTransition(props.status, props.recentEvent) &&
        <span
          className={`${props.classes.transition}`}
          data-qa-status={props.status}
        >
          <Cached style={{ fontSize: '1.0rem' }} />
        </span>
      }
    </React.Fragment>
  );
};

const decorate = withStyles(styles, { withTheme: true });

export default decorate<Props>(LinodeStatusIndicator);
