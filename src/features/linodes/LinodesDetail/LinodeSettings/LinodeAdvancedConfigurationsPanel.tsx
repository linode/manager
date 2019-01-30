import * as React from 'react';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import ExpansionPanel from 'src/components/ExpansionPanel';
import LinodeConfigs from './LinodeConfigs';
import LinodeDisks from './LinodeDisks';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

type CombinedProps = WithStyles<ClassNames>;

interface State {
  panelOpen: boolean;
}

class LinodeAdvancedConfigurationsPanel extends React.Component<
  CombinedProps,
  State
> {
  state: State = {
    panelOpen: false
  };

  handlePanelChange = (e: React.ChangeEvent<{}>, open: boolean) => {
    this.setState({ panelOpen: open });
  };

  render() {
    const { panelOpen } = this.state;
    return (
      <React.Fragment>
        {
          <ExpansionPanel
            heading="Advanced Configurations"
            onChange={this.handlePanelChange}
          >
            <LinodeConfigs active={panelOpen} />
            <LinodeDisks active={panelOpen} />
          </ExpansionPanel>
        }
      </React.Fragment>
    );
  }
}

const styled = withStyles<ClassNames>(styles);

export default styled(LinodeAdvancedConfigurationsPanel);
