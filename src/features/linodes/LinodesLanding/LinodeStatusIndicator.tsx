import * as React from 'react';

import {
  withStyles,
  StyleRulesCallback,
  WithStyles,
} from 'material-ui';
import Cached from 'material-ui-icons/Cached';

import transitionStatus from '../linodeTransitionStatus';

interface Props {
  status: Linode.LinodeStatus;
}

type CSSClasses = 'dot' | 'green' | 'red' | 'transition';

const styles: StyleRulesCallback<CSSClasses> = theme => ({
  dot: {
    fontSize: '1.5rem',
    userSelect: 'none',
  },
  transition: {
    marginLeft: -1,
  },
  green: {
    color: '#01b159',
  },
  red: {
    color: '#d01e1e',
  },
});

const LinodeStatusIndicator = (props: Props & WithStyles<CSSClasses>) => {
  return (
    <React.Fragment>
      {props.status === 'running' &&
        <span className={`${props.classes.dot} ${props.classes.green}`}>
          &#x25CF;
        </span>
      }
      {props.status === 'offline' &&
        <span className={`${props.classes.dot} ${props.classes.red}`}>
          &#x25CF;
        </span>
      }
      {transitionStatus.includes(props.status) &&
        <span className={`${props.classes.transition}`}>
          <Cached style={{ fontSize: '1.0rem' }} />
        </span>
      }
    </React.Fragment>
  );
};

const decorate = withStyles(styles, { withTheme: true });

export default decorate<Props>(LinodeStatusIndicator);
