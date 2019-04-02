import * as React from 'react';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LinodeDetailContextConsumer } from '../linodeDetailContext';
import LinodePermissionsError from '../LinodePermissionsError';
import LinodeAdvancedConfigurationsPanel from './LinodeAdvancedConfigurationsPanel';
import LinodeSettingsAlertsPanel from './LinodeSettingsAlertsPanel';
import LinodeSettingsDeletePanel from './LinodeSettingsDeletePanel';
import LinodeSettingsLabelPanel from './LinodeSettingsLabelPanel';
import LinodeSettingsPasswordPanel from './LinodeSettingsPasswordPanel';
import LinodeWatchdogPanel from './LinodeWatchdogPanel';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2
  }
});

type CombinedProps = WithStyles<ClassNames>;

const LinodeSettings: React.StatelessComponent<CombinedProps> = props => {
  const { classes } = props;

  return (
    <LinodeDetailContextConsumer>
      {({ linode }) => {
        if (!linode) {
          return null;
        }

        const permissionsError =
          linode._permissions === 'read_only' ? (
            <LinodePermissionsError />
          ) : null;

        return (
          <React.Fragment>
            <DocumentTitleSegment segment={`${linode.label} - Settings`} />
            {permissionsError}
            <Typography
              variant="h2"
              className={classes.title}
              data-qa-settings-header
            >
              Settings
            </Typography>
            <LinodeSettingsLabelPanel />
            <LinodeSettingsPasswordPanel
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
            <LinodeAdvancedConfigurationsPanel />
            <LinodeSettingsDeletePanel
              linodeId={linode.id}
              linodeLabel={linode.label}
            />
          </React.Fragment>
        );
      }}
    </LinodeDetailContextConsumer>
  );
};

const styled = withStyles(styles);

export default styled(LinodeSettings);
