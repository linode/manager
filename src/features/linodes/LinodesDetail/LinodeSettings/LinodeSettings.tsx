import * as React from 'react';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
  Typography,
} from 'material-ui';

import { compose } from 'ramda';

import { getLinodeDisks } from 'src/services/linodes';

import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';

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
  linodeStatus: string;
}

interface PromiseLoaderProps {
  linodeDisks: PromiseLoaderResponse<Linode.Disk[]>;
}

type CombinedProps = Props & PromiseLoaderProps & WithStyles<ClassNames>;

const LinodeSettings: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    classes,
    linodeAlerts,
    linodeConfigs,
    linodeId,
    linodeLabel,
    linodeMemory,
    linodeRegion,
    linodeStatus,
    linodeDisks,
  } = props;

  return (
    <React.Fragment>
      <Typography variant="headline" className={classes.title}>Settings</Typography>
      <LinodeSettingsLabelPanel
        linodeLabel={linodeLabel}
        linodeId={linodeId}
      />
      <LinodeSettingsPasswordPanel
        linodeDisks={linodeDisks.response}
        linodeLabel={linodeLabel}
        linodeId={linodeId}
      />
      <LinodeSettingsAlertsPanel
        linodeId={linodeId}
        linodeLabel={linodeLabel}
        linodeAlerts={linodeAlerts}
      />
      <LinodeConfigsPanel
        linodeDisks={linodeDisks.response}
        linodeId={linodeId}
        linodeLabel={linodeLabel}
        linodeRegion={linodeRegion}
        linodeConfigs={linodeConfigs}
        linodeMemory={linodeMemory}
        linodeStatus={linodeStatus}
      />
      <LinodeSettingsDeletePanel
        linodeId={linodeId}
      />
    </React.Fragment >
  );
};

const styled = withStyles(styles, { withTheme: true });

const loaded = PromiseLoader<Props>({
  linodeDisks: ({ linodeId }): Promise<Linode.Disk[]> => getLinodeDisks(linodeId)
    .then(response => response.data),
});

export default compose(styled, loaded)(LinodeSettings) as React.ComponentType<Props>;


