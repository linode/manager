import * as React from 'react';

import {
  withStyles,
  StyleRulesCallback,
  WithStyles,
  Theme,
} from 'material-ui';
import CircularProgress from 'material-ui/Progress/CircularProgress';

type CSSClasses = 'root' | 'top' | 'progress';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  progress: {
    position: 'relative',
  },

  top: {
    width: 120,
    height: 120,
    borderRadius: '50%',
    border: '1px solid #999',
    position: 'absolute',
    left: 0,
    top: 15,
    right: 0,
    margin: '0 auto',
  },

  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 150,
    height: 150,
    margin: '0 auto',
    flex: 1,
  },
});

interface Props {
  value?: Boolean | number;
}

const CircleProgressComponent = (props: Props & WithStyles<CSSClasses>) => {
  const variant = typeof props.value === 'number' ? 'static' : 'indeterminate';
  const value = typeof props.value === 'number' ? props.value : 0;
  return (
    <div className={props.classes.root}>
      <div className={props.classes.top} />
      <CircularProgress
        className={props.classes.progress}
        size={150}
        value={value}
        variant={variant}
        thickness={2}
      />
    </div>
  );
};

const decorate = withStyles(styles, { withTheme: true });

export default decorate<Props>(CircleProgressComponent);
