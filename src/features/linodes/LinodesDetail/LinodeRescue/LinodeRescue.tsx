import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';


type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {}

interface State {}

type CombinedProps = Props & WithStyles<ClassNames>;

class LinodeRescue extends React.Component<CombinedProps, State> {
  state = {};

  render() {
    return (<h1 data-qa-title>Rescue</h1>);
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(LinodeRescue);
