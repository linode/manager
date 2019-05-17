import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/core/styles';
import * as React from 'react';

import LinearProgress from 'src/components/core/LinearProgress';
import Typography from 'src/components/core/Typography';

type ClassNames = 'root' | 'primaryColor' | 'loadingText';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    padding: theme.spacing.unit * 2 + theme.spacing.unit / 4,
    backgroundColor: theme.color.grey2
  },
  primaryColor: {
    backgroundColor: theme.color.green
  },
  loadingText: {
    marginBottom: theme.spacing.unit * 2,
    textAlign: 'center'
  }
});

interface Props {
  max: number;
  value: number;
  isFetchingValue?: boolean;
  loadingText?: string;
  className?: string;
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
      loadingText
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
        />
      </div>
    );
  }
}

export const getPercentage = (value: number, max: number) =>
  (value / max) * 100;

const styled = withStyles(styles);

export default styled(BarPercent);
