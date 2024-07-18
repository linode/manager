import { Paper } from '@mui/material';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';

import { GlobalFilters } from '../Overview/GlobalFilters';
import { useLoadUserPreferences } from '../Utils/UserPreference';

import type { FiltersObject } from '../Overview/GlobalFilters';

export const DashboardLanding = () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const onFilterChange = React.useCallback((_filters: FiltersObject) => {}, []);
  const { isLoading } = useLoadUserPreferences();

  if (isLoading) {
    return <CircleProgress />;
  }

  return (
    <Paper>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '100%' }}>
          <GlobalFilters handleAnyFilterChange={onFilterChange}></GlobalFilters>
        </div>
      </div>
    </Paper>
  );
};
