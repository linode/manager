import * as classNames from 'classnames';
import * as React from 'react';
import LinearProgress from 'src/components/core/LinearProgress';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

type ClassNames =
  | 'root'
  | 'primaryColor'
  | 'overLimit'
  | 'loadingText'
  | 'rounded';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: 16,
      backgroundColor: theme.color.grey2
    },
    primaryColor: {
      backgroundColor: theme.color.green
    },
    overLimit: {
      '& > div': {
        backgroundColor: theme.palette.status.warningDark
      }
    },
    rounded: {
      borderRadius: theme.shape.borderRadius
    },
    loadingText: {
      marginBottom: theme.spacing(2),
      textAlign: 'center'
    }
  });

interface Props {
  max: number;
  value: number;
  isFetchingValue?: boolean;
  loadingText?: string;
  className?: string;
  rounded?: boolean;
  overLimit?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export class BarPercent extends React.PureComponent<CombinedProps, {}> {
  render() {
    const {
      classes,
      className,
      value,
      max,
      isFetchingValue,
      loadingText,
      rounded,
      overLimit
    } = this.props;
    return (
      <div className={className}>
        {isFetchingValue && loadingText && (
          <Typography className={classes.loadingText} variant="h3">
            {loadingText}
          </Typography>
        )}
        <LinearProgress
          value={getPercentage(value, max)}
          variant={isFetchingValue ? 'indeterminate' : 'determinate'}
          classes={{
            root: classes.root,
            barColorPrimary: classes.primaryColor
          }}
          className={classNames({
            [classes.rounded]: rounded,
            [classes.overLimit]: overLimit
          })}
        />
      </div>
    );
  }
}

export const getPercentage = (value: number, max: number) =>
  (value / max) * 100;

const styled = withStyles(styles);

export default styled(BarPercent);
