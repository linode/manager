import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';

import { ConfigsConsumer, LinodeConsumer } from '../context';
import LinodeAdvancedConfigurationsPanel from './LinodeAdvancedConfigurationsPanel';
import LinodeSettingsAlertsPanel from './LinodeSettingsAlertsPanel';
import LinodeSettingsDeletePanel from './LinodeSettingsDeletePanel';
import LinodeSettingsLabelPanel from './LinodeSettingsLabelPanel';
import LinodeSettingsPasswordPanel from './LinodeSettingsPasswordPanel';
import LinodeWatchdogPanel from './LinodeWatchdogPanel';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
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
          <ConfigsConsumer>
            {(configsContext) => {
              const { data: linode } = linodeContext;
              const { data: configs } = configsContext;

              if (!linode) { return null; }
              if (!configs) { return null; }
              return (
                <React.Fragment>
                  <DocumentTitleSegment segment={`${linodeContext.data!.label} - Settings`} />
                  <Typography
                    role="header"
                    variant="headline"
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
                  />
                </React.Fragment>
              )
            }}
          </ConfigsConsumer>
        );
      }}
    </LinodeConsumer>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled(LinodeSettings);
