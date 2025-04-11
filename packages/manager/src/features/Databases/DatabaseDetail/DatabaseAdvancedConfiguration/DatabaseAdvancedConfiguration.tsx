import { Box, Button, Paper, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import React from 'react';

import { Link } from 'src/components/Link';

import {
  StyledGridContainer,
  StyledLabelTypography,
} from '../DatabaseSummary/DatabaseSummaryClusterConfiguration.style';
import { StyledConfigValue } from './DatabaseAdvancedConfiguration.style';
import { DatabaseAdvancedConfigurationDrawer } from './DatabaseAdvancedConfigurationDrawer';

import type { Database } from '@linode/api-v4';
import { ADVANCED_CONFIG_LEARN_MORE_LINK } from '../../constants';
import { formatConfigValue } from './utilities';

interface Props {
  database: Database;
  disabled?: boolean;
}

export const DatabaseAdvancedConfiguration = ({ database }: Props) => {
  const [advancedConfigurationDrawerOpen, setAdvancedConfigurationDrawerOpen] =
    React.useState<boolean>(false);

  const engineConfigs = database.engine_config;

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
          buttonType="outlined"
          onClick={() => setAdvancedConfigurationDrawerOpen(true)}
          sx={{ height: 1 }}
          title="Configure"
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
