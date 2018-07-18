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

class MakeAPaymentPanel extends React.Component<CombinedProps, State> {
  state: State = {};

  render() {
    return (<ExpansionPanel heading="Make a Payment" />);
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(MakeAPaymentPanel);
