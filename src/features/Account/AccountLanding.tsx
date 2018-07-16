import * as React from 'react';

import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props { }

interface State { }

type CombinedProps = Props & WithStyles<ClassNames>;

export class AccountLanding extends React.Component<CombinedProps, State> {
  state: State = {};

  render() {
    return (<div>Hello World</div>);
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(AccountLanding);
