import { Box, Button, Paper, Typography } from '@linode/ui';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import React from 'react';

import { Link } from 'src/components/Link';

import { formatConfigValue } from '../../utilities';
import {
  StyledGridContainer,
  StyledLabelTypography,
} from '../DatabaseSummary/DatabaseSummaryClusterConfiguration.style';
import { StyledConfigValue } from './DatabaseAdvancedConfiguration.style';
import { DatabaseAdvancedConfigurationDrawer } from './DatabaseAdvancedConfigurationDrawer';

import type { Database } from '@linode/api-v4';

interface Props {
  database: Database;
  disabled?: boolean;
}

export const DatabaseAdvancedConfiguration = ({ database }: Props) => {
  const [
    advancedConfigurationDrawerOpen,
    setAdvancedConfigurationDrawerOpen,
  ] = React.useState<boolean>(false);

  const engine = database.engine;
  const engineConfigs = database.engine_config;

  return (
    <Paper sx={{ marginTop: 2, pb: 5 }}>
      <Grid container justifyContent={'space-between'}>
        <Grid lg={10}>
          <Typography variant="h2">Advanced Configuration</Typography>
          <Typography sx={{ mb: 1, mt: 1 }}>
            Advanced parameters to configure your database cluster.{' '}
            <Link to={''}>Learn more.</Link>
          </Typography>
        </Grid>
        <Button
          buttonType="outlined"
          onClick={() => setAdvancedConfigurationDrawerOpen(true)}
          sx={{ height: 1 }}
        >
          Configure
        </Button>
      </Grid>

      {engineConfigs ? (
        <StyledGridContainer
          container
          lg={10}
          mt={3}
          spacing={0}
          sx={{ wordBreak: 'break-all' }}
        >
          {Object.entries(engineConfigs).map(([key, value]) =>
            typeof value === 'object' ? (
              Object.entries(value!).map(([configLabel, configValue]) => (
                <React.Fragment key={`${key}-${configLabel}`}>
                  <Grid lg={5} md={4} xs={5}>
                    <StyledLabelTypography>{`${engine}.${configLabel}`}</StyledLabelTypography>
                  </Grid>
                  <StyledConfigValue lg={7} md={8} xs={7}>
                    {formatConfigValue(String(configValue))}
                  </StyledConfigValue>
                </React.Fragment>
              ))
            ) : (
              <>
                <Grid lg={5} md={4} xs={5}>
                  <StyledLabelTypography>{`${engine}.${key}`}</StyledLabelTypography>
                </Grid>
                <StyledConfigValue lg={7} md={8} xs={7}>
                  {formatConfigValue(String(value))}
                </StyledConfigValue>
              </>
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
