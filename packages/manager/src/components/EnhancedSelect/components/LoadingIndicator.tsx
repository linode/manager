import * as React from 'react';
import { IndicatorProps } from 'react-select';
import CircularProgress from 'src/components/core/CircularProgress';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
      right: 20,
    },
  });

interface Props extends IndicatorProps<any, any> {}

type CombinedProps = Props & WithStyles<ClassNames>;

class LoadingIndicator extends React.PureComponent<CombinedProps> {
  render() {
    const { classes } = this.props;

    return <CircularProgress size={20} className={classes.root} />;
  }
}

const styled = withStyles(styles);

export default styled(LoadingIndicator);
