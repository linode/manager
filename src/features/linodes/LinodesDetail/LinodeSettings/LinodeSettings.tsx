import * as React from 'react';

import { withStyles, StyleRulesCallback, Theme, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import LinodeSettingsAlertsPanel from './LinodeSettingsAlertsPanel';
import LinodeSettingsDeletePanel from './LinodeSettingsDeletePanel';

import LinodeSettingsLabelPanel from './LinodeSettingsLabelPanel';
import LinodeSettingsPasswordPanel from './LinodeSettingsPasswordPanel';
import LinodeConfigsPanel from './LinodeConfigsPanel';
import LinodeWatchdogPanel from './LinodeWatchdogPanel';

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
  linodeAlerts: Linode.LinodeAlerts;
  linodeConfigs: Linode.Config[];
  linodeRegion: string;
  linodeMemory: number;
  linodeTotalDisk: number;
  linodeStatus: string;
  linodeDisks: Linode.Disk[];
  linodeWatchdogEnabled: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const LinodeSettings: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    classes,
    linodeAlerts,
    linodeConfigs,
    linodeId,
    linodeLabel,
    linodeMemory,
    linodeTotalDisk,
    linodeRegion,
    linodeStatus,
    linodeDisks,
    linodeWatchdogEnabled,
  } = props;

  return (
    <React.Fragment>
      <Typography variant="headline" className={classes.title}>Settings</Typography>
      <LinodeSettingsLabelPanel
        linodeLabel={linodeLabel}
        linodeId={linodeId}
      />
      <LinodeSettingsPasswordPanel
        linodeDisks={linodeDisks}
        linodeLabel={linodeLabel}
        linodeId={linodeId}
        linodeStatus={linodeStatus}
      />
      <LinodeSettingsAlertsPanel
        linodeId={linodeId}
        linodeLabel={linodeLabel}
        linodeAlerts={linodeAlerts}
      />
      <LinodeWatchdogPanel
        linodeId={linodeId}
        currentStatus={linodeWatchdogEnabled}
      />
      <LinodeConfigsPanel
        linodeDisks={linodeDisks}
        linodeId={linodeId}
        linodeLabel={linodeLabel}
        linodeRegion={linodeRegion}
        linodeConfigs={linodeConfigs}
        linodeMemory={linodeMemory}
        linodeTotalDisk={linodeTotalDisk}
        linodeStatus={linodeStatus}
      />
      <LinodeSettingsDeletePanel
        linodeId={linodeId}
      />
    </React.Fragment >
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled(LinodeSettings);
