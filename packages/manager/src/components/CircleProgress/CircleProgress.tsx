import classNames from 'classnames';
import * as React from 'react';
import CircularProgress, {
  CircularProgressProps,
} from 'src/components/core/CircularProgress';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    position: 'relative',
    width: '100%',
    [theme.breakpoints.up('md')]: {
      flex: 1,
      height: 300,
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
  mini: {
    padding: theme.spacing() * 1.3,
  },
  noPadding: {
    padding: 0,
  },
  tag: {
    width: '12px !important',
    height: '12px !important',
    padding: 0,
    marginLeft: 4,
    marginRight: 4,
    '& circle': {
      stroke: 'white',
    },
  },
  valueInside: {
    position: 'absolute',
    marginTop: 4,
  },
}));

interface Props extends CircularProgressProps {
  className?: string;
  children?: JSX.Element;
  mini?: boolean;
  noInner?: boolean;
  noPadding?: boolean;
  tag?: boolean;
}

type CombinedProps = Props;

export const CircleProgressComponent: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const { className, children, mini, noInner, noPadding, tag, ...rest } = props;

  const variant = typeof props.value === 'number' ? 'static' : 'indeterminate';
  const value = typeof props.value === 'number' ? props.value : 0;

  return mini ? (
    <CircularProgress
      className={classNames({
        [classes.mini]: true,
        [classes.noPadding]: noPadding,
        [classes.tag]: tag,
      })}
      size={noPadding ? 22 : 40}
      aria-label="Content is loading"
      data-qa-circle-progress
      data-testid="circle-progress"
      tabIndex={0}
    />
  ) : (
    <div
      className={`${className} ${classes.root}`}
      aria-label="Content is loading"
    >
      {children !== undefined && (
        <div className={classes.valueInside}>{children}</div>
      )}
      {noInner !== true && (
        <div className={classes.topWrapper}>
          <div className={classes.top} />
        </div>
      )}
      <CircularProgress
        {...rest}
        className={classes.progress}
        size={124}
        value={value}
        variant={variant}
        thickness={2}
        data-qa-circle-progress={value}
        data-testid="circle-progress"
      />
    </div>
  );
};

export default CircleProgressComponent;
