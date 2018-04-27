import * as React from 'react';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
  Typography,
} from 'material-ui';

import LinodeConfigsEmptyState from './LinodeConfigsEmptyState';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface State { }

interface Props {
  configs: Linode.Config[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class LinodeConfigsPanel extends React.Component<CombinedProps, State> {
  state: State = {};

  render() {
    const { configs } = this.props;

    return (
      <React.Fragment>
        <Typography variant="headline">Configurations</Typography>
        {
          !configs || configs.length === 0 && <LinodeConfigsEmptyState />
        }
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(LinodeConfigsPanel);


