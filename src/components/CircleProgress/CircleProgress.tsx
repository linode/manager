import * as classNames from 'classnames';
import * as React from 'react';

import CircularProgress, { CircularProgressProps } from '@material-ui/core/CircularProgress';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

type CSSClasses = 'root'
| 'top'
| 'progress'
| 'topWrapper'
| 'noTopMargin'
| 'mini'
| 'hasValueInside'
| 'green'
| 'valueInside';

const styles: StyleRulesCallback<CSSClasses> = (theme) => ({
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
      width: '72px !important',
      height: '72px !important',
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
  mini: {
    padding: theme.spacing.unit * 1.3,
  },
  valueInside: {
    position: 'absolute',
  },
  hasValueInside: {},
  green: {
    '& circle': {
      stroke: theme.color.green,
    },
    '& $progress': {
      [theme.breakpoints.down('xs')]: {
        width: '128px !important',
        height: '128px !important',
      },
    },
    '& $top': {
      width: 120,
      height: 120,
    },
  },
});

interface Props extends CircularProgressProps {
  noTopMargin?: boolean;
  className?: string;
  noInner?: boolean;
  mini?: boolean;
  children?: JSX.Element;
  green?: boolean;
}

type CombinedProps = Props & WithStyles<CSSClasses>;

const circleProgressComponent: React.StatelessComponent<CombinedProps> = (props) => {
  const variant = typeof props.value === 'number' ? 'static' : 'indeterminate';
  const value = typeof props.value === 'number' ? props.value : 0;
  const { children, classes, noTopMargin, green, ...rest } = props;

  const outerClasses = {
    [classes.root]: true,
    [classes.noTopMargin]: noTopMargin,
    [classes.hasValueInside]: children !== undefined,
    [classes.green]: green,
  };

  if (props.className) {
    outerClasses[props.className] = true;
  }

  return (
    (!props.mini)
      ? <div className={classNames({
        [classes.root]: true,
        [classes.noTopMargin]: noTopMargin,
      },
        outerClasses,
      )}
      >
        {children !== undefined &&
          <div className={classes.valueInside}>
            {children}
          </div>
        }
        {(props.noInner !== true) &&
          <div className={classes.topWrapper}>
            <div className={classes.top} />
          </div>
        }
        <CircularProgress
          {...rest}
          className={classes.progress}
          size={green ? 128 : 124}
          value={value}
          variant={variant}
          thickness={green ? 4 : 2}
          data-qa-circle-progress={value}
        />
      </div>
      : <CircularProgress 
          className={classes.mini}
          data-qa-circle-progress
        />
  );
};

const decorate = withStyles(styles, { withTheme: true });

export default decorate<Props>(circleProgressComponent);
