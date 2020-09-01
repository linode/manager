import * as classNames from 'classnames';
import * as React from 'react';
import CircularProgress, {
  CircularProgressProps
} from 'src/components/core/CircularProgress';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type CSSClasses =
  | 'root'
  | 'top'
  | 'progress'
  | 'topWrapper'
  | 'noTopMargin'
  | 'mini'
  | 'tag'
  | 'sort'
  | 'hasValueInside'
  | 'green'
  | 'valueInside'
  | 'noPadding';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      width: '100%',
      margin: '0 auto 20px',
      [theme.breakpoints.up('md')]: {
        flex: 1,
        height: 300
      }
    },
    progress: {
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        width: '72px !important',
        height: '72px !important'
      }
    },
    top: {
      width: 70,
      height: 70,
      borderRadius: '50%',
      border: '1px solid #999',
      [theme.breakpoints.up('sm')]: {
        width: 120,
        height: 120
      }
    },
    topWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      width: '100%',
      height: '100%'
    },
    noTopMargin: {
      [theme.breakpoints.up('md')]: {
        top: 0,
        height: 'auto'
      }
    },
    mini: {
      padding: theme.spacing(1) * 1.3
    },
    tag: {
      width: '12px !important',
      height: '12px !important',
      padding: 0,
      marginLeft: 4,
      marginRight: 4,
      '& circle': {
        stroke: 'white'
      }
    },
    sort: {
      width: '14px !important',
      height: '14px !important',
      padding: 0,
      position: 'relative',
      top: 4,
      marginLeft: 8,
      marginRight: 4
    },
    valueInside: {
      position: 'absolute',
      marginTop: 4
    },
    hasValueInside: {},
    green: {
      '& circle': {
        stroke: theme.color.green
      },
      '& $progress': {
        width: '93px !important',
        height: '93px !important'
      },
      '& $top': {
        width: 85,
        height: 85
      }
    },
    noPadding: {
      padding: 0
    }
  });

interface Props extends CircularProgressProps {
  noTopMargin?: boolean;
  className?: string;
  noInner?: boolean;
  mini?: boolean;
  tag?: boolean;
  sort?: boolean;
  children?: JSX.Element;
  green?: boolean;
  noPadding?: boolean;
}

type CombinedProps = Props & WithStyles<CSSClasses>;

class CircleProgressComponent extends React.Component<CombinedProps> {
  render() {
    const variant =
      typeof this.props.value === 'number' ? 'static' : 'indeterminate';
    const value = typeof this.props.value === 'number' ? this.props.value : 0;
    const {
      children,
      classes,
      noTopMargin,
      green,
      mini,
      tag,
      sort,
      noInner,
      noPadding,
      ...rest
    } = this.props;

    const outerClasses = {
      [classes.root]: true,
      [classes.noTopMargin]: noTopMargin,
      [classes.hasValueInside]: children !== undefined,
      [classes.green]: green,
      [classes.noPadding]: noPadding
    };

    if (this.props.className) {
      outerClasses[this.props.className] = true;
    }

    return !mini ? (
      <div
        className={classNames(
          {
            [classes.root]: true,
            [classes.noTopMargin]: noTopMargin
          },
          outerClasses
        )}
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
          size={green ? 128 : 124}
          value={value}
          variant={variant}
          thickness={green ? 4 : 2}
          data-qa-circle-progress={value}
          data-testid="circle-progress"
        />
      </div>
    ) : (
      <CircularProgress
        className={classNames({
          [classes.mini]: true,
          [classes.tag]: tag,
          [classes.sort]: sort,
          [classes.noPadding]: noPadding
        })}
        size={noPadding ? 22 : 40}
        data-qa-circle-progress
        aria-label="Content is loading"
        data-testid="circle-progress"
        tabIndex={0}
      />
    );
  }
}
const styled = withStyles(styles);

export default styled(CircleProgressComponent);
