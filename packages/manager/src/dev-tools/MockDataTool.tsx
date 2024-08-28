import Grid from '@mui/material/Grid2';
import * as React from 'react';

import { ServiceWorkerTool } from './ServiceWorkerTool';

export const MockDataTool = () => {
  return (
    (<Grid container>
      <Grid size={12}>
        <h4 style={{ marginBottom: 8, marginTop: 0 }}>Mock Data</h4>
      </Grid>
      <Grid size={12}>
        <ServiceWorkerTool />
      </Grid>
    </Grid>)
  );
};
