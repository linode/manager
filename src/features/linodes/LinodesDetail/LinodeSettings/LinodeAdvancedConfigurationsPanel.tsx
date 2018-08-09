import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import ExpansionPanel from 'src/components/ExpansionPanel';

import LinodeConfigs from './LinodeConfigs';
import LinodeDisks from './LinodeDisks';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface State {}

interface Props {}

type CombinedProps = Props & WithStyles<ClassNames>;

class LinodeAdvancedConfigurationsPanel extends React.Component<CombinedProps, State> {
  render() {
    return (
      <React.Fragment>
        {
          <ExpansionPanel heading="Advanced Configurations">
            <LinodeConfigs />
            <LinodeDisks />
          </ExpansionPanel>
        }
      </React.Fragment>
    );
  }
}

const styled = withStyles<ClassNames>(styles, { withTheme: true });

export default styled(LinodeAdvancedConfigurationsPanel);
