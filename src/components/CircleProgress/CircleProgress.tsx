import * as React from 'react';

import {
  withStyles,
  StyleRulesCallback,
  WithStyles,
  Theme,
} from 'material-ui';
import CircularProgress from 'material-ui/Progress/CircularProgress';

type CSSClasses = 'root' | 'top' | 'bottom' | 'progress';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
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
        size={100}
        value={value}
        variant={variant}
      />
      <div className={props.classes.bottom} />
    </div>
  );
};

const decorate = withStyles(styles, { withTheme: true });

export default decorate<Props>(CircleProgressComponent);
