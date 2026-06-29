import { Button } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';

import { Link } from 'src/components/Link';

import { ADVANCED_CONFIG_LEARN_MORE_LINK } from '../../constants';
import { Paper } from '../../shared/Paper/Paper';
import { cssVars } from '../../shared/utilities/cssVars';
import styles from '../DatabaseDetail.module.css';
import { useDatabaseDetailContext } from '../DatabaseDetailContext';
import { StyledLabelTypography } from '../DatabaseSummary/DatabaseSummaryClusterConfiguration.style';
import { DatabaseAdvancedConfigurationDrawer } from './DatabaseAdvancedConfigurationDrawer';
import { formatConfigValue } from './utilities';

export const DatabaseAdvancedConfiguration = () => {
  const navigate = useNavigate();
  const { database, isAdvancedConfigEnabled, engine } =
    useDatabaseDetailContext();
  const [advancedConfigurationDrawerOpen, setAdvancedConfigurationDrawerOpen] =
    React.useState<boolean>(false);

  const style = cssVars({
    '--summary-label-width': '30%',
  });

  const engineConfigs = database.engine_config;

  if (!isAdvancedConfigEnabled) {
    navigate({
      to: `/databases/$engine/$databaseId/summary`,
      params: {
        engine,
        databaseId: database.id,
      },
    });
    return null;
  }

  return (
    <Paper paddingBottom={Spacing.S40}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ marginTop: Spacing.S4, marginBottom: 0 }}>
            Advanced Configuration
          </h3>
          <p style={{ marginBottom: Spacing.S8, marginTop: Spacing.S8 }}>
            Advanced parameters to configure your database cluster.{' '}
            <Link to={ADVANCED_CONFIG_LEARN_MORE_LINK}>Learn more.</Link>
          </p>
        </div>
        <Button
          data-testid="configure-database"
          onClick={() => setAdvancedConfigurationDrawerOpen(true)}
          title="Configure"
          variant="secondary"
        >
          Configure
        </Button>
      </div>

      {engineConfigs ? (
        <div
          className={styles.summaryLabelValueContainer}
          style={{ wordBreak: 'break-all', marginTop: Spacing.S16, ...style }}
        >
          {Object.entries(engineConfigs).map(([key, value]) =>
            typeof value === 'object' ? (
              Object.entries(value!).map(([configLabel, configValue]) => (
                <React.Fragment key={`${key}-${configLabel}`}>
                  <div className={styles.summaryLabelColumn}>
                    <StyledLabelTypography>{`${key}.${configLabel}`}</StyledLabelTypography>
                  </div>
                  <div className={styles.summaryValueColumn}>
                    {formatConfigValue(String(configValue))}
                  </div>
                </React.Fragment>
              ))
            ) : (
              <React.Fragment key={key}>
                <div className={styles.summaryLabelColumn}>
                  <StyledLabelTypography>{`${key}`}</StyledLabelTypography>
                </div>
                <div className={styles.summaryValueColumn}>
                  {formatConfigValue(String(value))}
                </div>
              </React.Fragment>
            )
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexGrow: 1, justifyContent: 'center' }}>
          <p style={{ marginTop: Spacing.S40 }}>
            No advanced configurations have been added.
          </p>
        </div>
      )}

      <DatabaseAdvancedConfigurationDrawer
        database={database}
        onClose={() => setAdvancedConfigurationDrawerOpen(false)}
        open={advancedConfigurationDrawerOpen}
      />
    </Paper>
  );
};
