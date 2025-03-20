import { useNodeBalancerQuery } from '@linode/queries';
import Grid from '@mui/material/Grid2';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';

import { SummaryPanel } from './SummaryPanel';
import { TablesPanel } from './TablesPanel';

export const NodeBalancerSummary = () => {
  const { id } = useParams({
    from: '/nodebalancers/$id/summary',
  });
  const { data: nodebalancer } = useNodeBalancerQuery(Number(id), Boolean(id));

  return (
    <div>
      <DocumentTitleSegment segment={`${nodebalancer?.label} - Summary`} />
      <Grid container spacing={2}>
        <Grid size={{ lg: 9, md: 8, xs: 12 }}>
          <TablesPanel />
        </Grid>
        <Grid size={{ lg: 3, md: 4, xs: 12 }}>
          <SummaryPanel />
        </Grid>
      </Grid>
    </div>
  );
};
