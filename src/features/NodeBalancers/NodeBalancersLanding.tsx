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

interface State {
  deleteConfirmAlertOpen: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class NodeBalancersLanding extends React.Component<CombinedProps, State> {
  state: State = {
    deleteConfirmAlertOpen: false,
  };

  render() {
    return (
      <div>Hello World</div>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(NodeBalancersLanding);
