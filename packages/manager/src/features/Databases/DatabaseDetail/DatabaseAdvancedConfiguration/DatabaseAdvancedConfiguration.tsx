import { Box, Paper, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { useNavigate } from '@tanstack/react-router';
import { Button } from 'akamai-cds-react-components';
import React from 'react';

import { Link } from 'src/components/Link';

import { ADVANCED_CONFIG_LEARN_MORE_LINK } from '../../constants';
import { useDatabaseDetailContext } from '../DatabaseDetailContext';
import {
  StyledGridContainer,
  StyledLabelTypography,
} from '../DatabaseSummary/DatabaseSummaryClusterConfiguration.style';
import { StyledConfigValue } from './DatabaseAdvancedConfiguration.style';
import { DatabaseAdvancedConfigurationDrawer } from './DatabaseAdvancedConfigurationDrawer';
import { formatConfigValue } from './utilities';

export const DatabaseAdvancedConfiguration = () => {
  const navigate = useNavigate();
  const { database, isAdvancedConfigEnabled, engine } =
    useDatabaseDetailContext();
  const [advancedConfigurationDrawerOpen, setAdvancedConfigurationDrawerOpen] =
    React.useState<boolean>(false);

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
    <Paper sx={{ marginTop: 2, pb: 5 }}>
      <Grid container justifyContent={'space-between'}>
        <Grid size={10}>
          <Typography variant="h2">Advanced Configuration</Typography>
          <Typography sx={{ mb: 1, mt: 1 }}>
            Advanced parameters to configure your database cluster.{' '}
            <Link to={ADVANCED_CONFIG_LEARN_MORE_LINK}>Learn more.</Link>
          </Typography>
        </Grid>
        <Button
          data-testid="configure-database"
          onClick={() => setAdvancedConfigurationDrawerOpen(true)}
          title="Configure"
          variant="secondary"
        >
          Configure
        </Button>
      </Grid>

      {engineConfigs ? (
        <StyledGridContainer
          container
          mt={3}
          size={11}
          spacing={0}
          sx={{ wordBreak: 'break-all' }}
        >
          {Object.entries(engineConfigs).map(([key, value]) =>
            typeof value === 'object' ? (
              Object.entries(value!).map(([configLabel, configValue]) => (
                <React.Fragment key={`${key}-${configLabel}`}>
                  <Grid size={{ lg: 4, md: 4, xs: 5 }}>
                    <StyledLabelTypography>{`${key}.${configLabel}`}</StyledLabelTypography>
                  </Grid>
                  <StyledConfigValue size={{ lg: 8, md: 8, xs: 7 }}>
                    {formatConfigValue(String(configValue))}
                  </StyledConfigValue>
                </React.Fragment>
              ))
            ) : (
              <React.Fragment key={key}>
                <Grid size={{ lg: 4, md: 4, xs: 5 }}>
                  <StyledLabelTypography>{`${key}`}</StyledLabelTypography>
                </Grid>
                <StyledConfigValue size={{ lg: 8, md: 8, xs: 7 }}>
                  {formatConfigValue(String(value))}
                </StyledConfigValue>
              </React.Fragment>
            )
          )}
        </StyledGridContainer>
      ) : (
        <Box display="flex" flexGrow={1} justifyContent="center">
          <Typography sx={{ marginTop: 5 }}>
            No advanced configurations have been added.
          </Typography>
        </Box>
      )}

      <DatabaseAdvancedConfigurationDrawer
        database={database}
        onClose={() => setAdvancedConfigurationDrawerOpen(false)}
        open={advancedConfigurationDrawerOpen}
      />
    </Paper>
  );
};
