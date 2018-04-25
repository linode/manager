import * as React from 'react';
import { compose, lensPath, set } from 'ramda';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
  Typography,
} from 'material-ui';

import ExpansionPanel from 'src/components/ExpansionPanel';

import LinodeSettingsLabelPanel from './LinodeSettingsLabelPanel';
import LinodeSettingsPasswordPanel from './LinodeSettingsPasswordPanel';
import LinodeSettingsAlertsPanel from './LinodeSettingsAlertsPanel';
import LinodeSettingsDeletePanel from './LinodeSettingsDeletePanel';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
});

interface Props {
  linodeId: number;
  linodeLabel: string;
  alerts: Linode.LinodeAlerts;
}

interface State {
  linodeLabel: string;
  alerts: Linode.LinodeAlerts;
}

type CombinedProps = Props
  & WithStyles<ClassNames>;

class LinodeSettings extends React.Component<CombinedProps, State> {
  state: State = {
    linodeLabel: this.props.linodeLabel,
    alerts: this.props.alerts,
  };

  componentWillReceiveProps(nextProps: CombinedProps) {
    if (nextProps.linodeLabel !== this.state.linodeLabel) {
      this.setState(compose(
        set(lensPath(['linodeLabel']), nextProps.linodeLabel),
      ));
    }

    if (nextProps.alerts !== this.state.alerts) {
      this.setState(compose(
        set(lensPath(['alerts']), nextProps.alerts),
      ));
    }
  }

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <Typography variant="headline" className={classes.title}>Settings</Typography>
        <LinodeSettingsLabelPanel
          linodeLabel={this.state.linodeLabel}
          linodeId={this.props.linodeId}
        />
        <LinodeSettingsPasswordPanel
          linodeLabel={this.state.linodeLabel}
          linodeId={this.props.linodeId}
        />
        <LinodeSettingsAlertsPanel
          linodeId={this.props.linodeId}
          linodeLabel={this.state.linodeLabel}
          linodeAlerts={this.state.alerts}
        />
        <ExpansionPanel defaultExpanded heading="Shutdown Watchdog"></ExpansionPanel>
        <ExpansionPanel defaultExpanded heading="Advanced Configurations"></ExpansionPanel>
        <LinodeSettingsDeletePanel
          linodeId={this.props.linodeId}
        />
      </React.Fragment >
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(LinodeSettings);
