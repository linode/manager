import { useNodeBalancerQuery } from '@linode/queries';
import Grid from '@mui/material/Grid';
import { createLazyRoute, useParams } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';

import { SummaryPanel } from './SummaryPanel';
import { TablesPanel } from './TablesPanel';

const NodeBalancerSummary = () => {
  const { id } = useParams({ from: '/nodebalancers/$id' });
  const { data: nodebalancer } = useNodeBalancerQuery(id);

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

export const nodeBalancerSummaryLazyRoute = createLazyRoute(
  '/nodebalancers/$id/summary'
)({
  component: NodeBalancerSummary,
});
