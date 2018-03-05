import * as React from 'react';

import {
  withStyles,
  StyleRulesCallback,
  WithStyles,
} from 'material-ui';

interface Props {
  status: Linode.LinodeStatus;
}

type CSSClasses = 'dot' | 'green' | 'red';

const styles: StyleRulesCallback<CSSClasses> = theme => ({
  dot: {
    fontSize: '1.5rem',
    userSelect: 'none',
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
      {props.status !== 'running' &&
        <span className={`${props.classes.dot} ${props.classes.red}`}>
          &#x25CF;
        </span>
      }
    </React.Fragment>
  );
};

const decorate = withStyles(styles, { withTheme: true });

export default decorate<Props>(LinodeStatusIndicator);
