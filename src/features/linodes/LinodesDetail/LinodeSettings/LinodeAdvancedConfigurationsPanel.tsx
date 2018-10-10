import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import ExpansionPanel from 'src/components/ExpansionPanel';

import LinodeConfigs from './LinodeConfigs';
import LinodeDisks from './LinodeDisks';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

type CombinedProps = WithStyles<ClassNames>;

interface State {
  disksActive: boolean;
}

class LinodeAdvancedConfigurationsPanel extends React.Component<CombinedProps, State> {
  state: State = {
    disksActive: false,
  }

  handlePanelChange = (e: React.ChangeEvent<{}>, open: boolean) => {
    this.setState({ disksActive: open });
  };

  render() {
    const { disksActive } = this.state;
    return (
      <React.Fragment>
        {
          <ExpansionPanel heading="Advanced Configurations" onChange={this.handlePanelChange}>
            <LinodeConfigs />
            <LinodeDisks active={disksActive} />
          </ExpansionPanel>
        }
      </React.Fragment>
    );
  }
}

const styled = withStyles<ClassNames>(styles, { withTheme: true });

export default styled(LinodeAdvancedConfigurationsPanel);
