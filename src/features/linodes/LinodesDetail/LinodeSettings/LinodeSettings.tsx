import * as React from 'react';

import { withStyles, StyleRulesCallback, Theme, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import LinodeSettingsAlertsPanel from './LinodeSettingsAlertsPanel';
import LinodeSettingsDeletePanel from './LinodeSettingsDeletePanel';

import LinodeSettingsLabelPanel from './LinodeSettingsLabelPanel';
import LinodeSettingsPasswordPanel from './LinodeSettingsPasswordPanel';
import LinodeConfigsPanel from './LinodeConfigsPanel';
import LinodeWatchdogPanel from './LinodeWatchdogPanel';
import { LinodeConsumer, DisksConsumer, ConfigsConsumer } from '../context';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
});

type CombinedProps = WithStyles<ClassNames>;

const LinodeSettings: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes } = props;

  return (
    <LinodeConsumer>
      {(linodeContext) => {
        return (
          <DisksConsumer>
            {(disksContext) => {
              return (
                <ConfigsConsumer>
                  {(configsContext) => {
                    const { data: linode } = linodeContext;
                    const { data: disks } = disksContext;
                    const { data: configs } = configsContext;

                    if (!linode) { return null; }
                    if (!disks) { return null; }
                    if (!configs) { return null; }
                    return (
                      <React.Fragment>
                        <Typography variant="headline" className={classes.title}>Settings</Typography>
                        <LinodeSettingsLabelPanel />
                        <LinodeSettingsPasswordPanel
                          linodeDisks={disks}
                          linodeLabel={linode.label}
                          linodeId={linode.id}
                          linodeStatus={linode.status}
                        />
                        <LinodeSettingsAlertsPanel
                          linodeId={linode.id}
                          linodeLabel={linode.label}
                          linodeAlerts={linode.alerts}
                        />
                        <LinodeWatchdogPanel
                          linodeId={linode.id}
                          currentStatus={linode.watchdog_enabled}
                        />
                        <LinodeConfigsPanel
                          linodeDisks={disks}
                          linodeId={linode.id}
                          linodeLabel={linode.label}
                          linodeRegion={linode.region}
                          linodeConfigs={configs}
                          linodeMemory={linode.specs.memory}
                          linodeTotalDisk={linode.specs.disk}
                          linodeStatus={linode.status}
                        />
                        <LinodeSettingsDeletePanel
                          linodeId={linode.id}
                        />
                      </React.Fragment>
                    )
                  }}
                </ConfigsConsumer>
              );
            }}
          </DisksConsumer>
        );
      }}
    </LinodeConsumer>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled(LinodeSettings);
