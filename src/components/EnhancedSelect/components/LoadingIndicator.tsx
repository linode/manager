import CircularProgress from '@material-ui/core/CircularProgress';
import * as React from 'react';
import { IndicatorProps } from 'react-select/lib/components/indicators';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    position: 'relative',
    right: 20,
  },
});

interface Props extends IndicatorProps<any> { }

type CombinedProps = Props & WithStyles<ClassNames>;

class LoadingIndicator extends React.PureComponent<CombinedProps> {

  render() {
    const { classes } = this.props;

    return (
        <CircularProgress
          size={20}
          className={classes.root}
        />
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(LoadingIndicator);
