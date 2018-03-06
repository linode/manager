import * as React from 'react';

import {
  withStyles,
  StyleRulesCallback,
  WithStyles,
} from 'material-ui';
import CircularProgress from 'material-ui/Progress/CircularProgress';

type CSSClasses = 'root' | 'top' | 'bottom' | 'progress';

const styles: StyleRulesCallback<CSSClasses> = theme => ({
  progress: {
    margin: theme.spacing.unit * 2,
    maxWidth: '50%',
  },

  top: { alignSelf: 'flex-start' },

  bottom: { alignSelf: 'flex-end' },

  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
});

const CircleProgressComponent = (props: WithStyles<CSSClasses>) => {
  return (
    <div className={props.classes.root}>
      <div className={props.classes.top} />
      <CircularProgress className={props.classes.progress} size={100} />
      <div className={props.classes.bottom} />
    </div>
  );
};

const decorate = withStyles(styles, { withTheme: true });

export default decorate<{}>(CircleProgressComponent);
