import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import ExpansionPanel from 'src/components/ExpansionPanel';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {}

interface State {}

type CombinedProps = Props & WithStyles<ClassNames>;

class RecentBillingActivityPanel extends React.Component<CombinedProps, State> {
  state: State = {};

  render() {
    return (<ExpansionPanel heading="Recent Billing Activity" />);
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(RecentBillingActivityPanel);
