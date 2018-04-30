import * as React from 'react';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
  Typography,
} from 'material-ui';

import LinodeSettingsLabelPanel from './LinodeSettingsLabelPanel';
import LinodeSettingsPasswordPanel from './LinodeSettingsPasswordPanel';
import LinodeSettingsAlertsPanel from './LinodeSettingsAlertsPanel';
import LinodeSettingsDeletePanel from './LinodeSettingsDeletePanel';
import LinodeConfigsPanel from './LinodeConfigsPanel';

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
}

type CombinedProps = Props
  & WithStyles<ClassNames>;

const LinodeSettings: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    classes,
    linodeAlerts,
    linodeConfigs,
    linodeId,
    linodeLabel,
    linodeMemory,
    linodeRegion,
  } = props;

  return (
    <React.Fragment>
      <Typography variant="headline" className={classes.title}>Settings</Typography>
      <LinodeSettingsLabelPanel
        linodeLabel={linodeLabel}
        linodeId={linodeId}
      />
      <LinodeSettingsPasswordPanel
        linodeLabel={linodeLabel}
        linodeId={linodeId}
      />
      <LinodeSettingsAlertsPanel
        linodeId={linodeId}
        linodeLabel={linodeLabel}
        linodeAlerts={linodeAlerts}
      />
      <LinodeConfigsPanel
        linodeId={linodeId}
        linodeRegion={linodeRegion}
        linodeConfigs={linodeConfigs}
        linodeMemory={linodeMemory}
      />
      <LinodeSettingsDeletePanel
        linodeId={linodeId}
      />
    </React.Fragment >
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled(LinodeSettings);
