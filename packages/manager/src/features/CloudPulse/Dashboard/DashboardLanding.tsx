import { Paper } from '@mui/material';
import * as React from 'react';

import { FiltersObject, GlobalFilters } from '../Overview/GlobalFilters';

export const DashboardLanding = () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const onFilterChange = (_filters: FiltersObject) => {};
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
