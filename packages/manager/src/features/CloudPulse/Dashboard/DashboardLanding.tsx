import { Paper, Stack } from '@mui/material';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';

import { GlobalFilters } from '../Overview/GlobalFilters';
import { useLoadUserPreferences } from '../Utils/UserPreference';
import { CloudPulseDashboard } from './CloudPulseDashboard';

import type { FiltersObject } from '../Overview/GlobalFilters';
import type { TimeDuration } from '@linode/api-v4';

export const DashboardLanding = () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const onFilterChange = React.useCallback((_filters: FiltersObject) => {}, []);
  const { isLoading } = useLoadUserPreferences();

  if (isLoading) {
    return <CircleProgress />;
  }

  return (
    <Stack spacing={2}>
      <Paper sx={{ border: '1px solid #e3e5e8' }}>
        <div style={{ display: 'flex' }}>
          <div style={{ width: '100%' }}>
            <GlobalFilters
              handleAnyFilterChange={onFilterChange}
            ></GlobalFilters>
          </div>
        </div>
      </Paper>
      <CloudPulseDashboard
        dashboardId={1}
        duration={{} as TimeDuration}
        region="us-east"
        resources={['123', '456']}
        savePref={true}
      />
    </Stack>
  );
};
