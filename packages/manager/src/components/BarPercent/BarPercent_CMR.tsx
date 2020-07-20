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
  | 'rounded'
  | 'secondaryColor'
  | 'dashed';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: 14,
      backgroundColor: theme.color.grey2,
      '&.narrow': {
        padding: 8
      }
    },
    primaryColor: {
      backgroundColor: '#5ad865'
    },
    secondaryColor: {
      backgroundColor: '#99ec79'
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
    },
    dashed: {
      display: 'none'
    }
  });

interface Props {
  max: number;
  value: number;
  valueBuffer?: number;
  isFetchingValue?: boolean;
  loadingText?: string;
  className?: string;
  rounded?: boolean;
  overLimit?: boolean;
  narrow?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export class BarPercent extends React.PureComponent<CombinedProps, {}> {
  render() {
    const {
      classes,
      className,
      value,
      valueBuffer,
      narrow,
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
          valueBuffer={valueBuffer}
          variant={
            isFetchingValue
              ? 'indeterminate'
              : valueBuffer
              ? 'buffer'
              : 'determinate'
          }
          classes={{
            root: classes.root,
            barColorPrimary: classes.primaryColor,
            bar2Buffer: classes.secondaryColor,
            dashed: classes.dashed
          }}
          className={classNames({
            [classes.rounded]: rounded,
            [classes.overLimit]: overLimit,
            narrow
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
