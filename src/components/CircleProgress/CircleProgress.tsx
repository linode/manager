import * as React from 'react';
import * as classNames from 'classnames';

import { StyleRulesCallback, Theme, withStyles, WithStyles  } from '@material-ui/core/styles';

import CircularProgress from '@material-ui/core/CircularProgress';

type CSSClasses = 'root'
| 'top'
| 'progress'
| 'topWrapper'
| 'noTopMargin';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    margin: '0 auto',
    [theme.breakpoints.up('md')]: {
      top: '8vh',
      height: '100%',
      flex: 1,
    },
  },
  progress: {
    position: 'relative',
    [theme.breakpoints.down('xs')]: {
      width: '86px !important',
      height: '86px !important',
    },
  },
  top: {
    width: 70,
    height: 70,
    borderRadius: '50%',
    border: '1px solid #999',
    [theme.breakpoints.up('sm')]: {
      width: 120,
      height: 120,
    },
  },
  topWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  noTopMargin: {
    [theme.breakpoints.up('md')]: {
      top: 0,
    },
  },
});

interface Props {
  value?: Boolean | number;
  noTopMargin?: boolean;
  className?: string;
  noInner?: boolean;
}

const CircleProgressComponent = (props: Props & WithStyles<CSSClasses>) => {
  const variant = typeof props.value === 'number' ? 'static' : 'indeterminate';
  const value = typeof props.value === 'number' ? props.value : 0;
  const { classes, noTopMargin } = props;

  const outerClasses = {
    [classes.root]: true,
    [classes.noTopMargin]: noTopMargin,
  };

  if (props.className) {
    outerClasses[props.className] = true;
  }

  return (
    <div className={classNames(outerClasses)}>
      {(props.noInner !== true) &&
        <div className={classes.topWrapper}>
          <div className={classes.top} />
        </div>
      }
      <CircularProgress
        className={classes.progress}
        size={124}
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
