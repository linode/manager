import * as React from 'react';

import {
  withStyles,
  StyleRulesCallback,
  WithStyles,
  Theme,
} from 'material-ui';
import CircularProgress from 'material-ui/Progress/CircularProgress';

type CSSClasses = 'root'
| 'top'
| 'progress'
| 'topWrapper';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    height: '100%',
    margin: '0 auto',
    flex: 1,
  },
  progress: {
    position: 'relative',
    '& circle': {
      transition: 'stroke-dasharray .5s linear, stroke-dashoffset .5s linear',
    },
  },
  top: {
    width: 120,
    height: 120,
    borderRadius: '50%',
    border: '1px solid #999',
  },
  topWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});

interface Props {
  value?: Boolean | number;
}

const CircleProgressComponent = (props: Props & WithStyles<CSSClasses>) => {
  const variant = typeof props.value === 'number' ? 'static' : 'indeterminate';
  const value = typeof props.value === 'number' ? props.value : 0;
  const { classes } = props;

  return (
    <div className={classes.root}>
      <div className={classes.topWrapper}>
        <div className={classes.top} />
      </div>
      <CircularProgress
        className={classes.progress}
        size={150}
        value={value}
        variant={variant}
        thickness={2}
        data-qa-circle-progress
      />
    </div>
  );
};

const decorate = withStyles(styles, { withTheme: true });

export default decorate<Props>(CircleProgressComponent);
