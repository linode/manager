import Grid from '@mui/material/Grid2';
import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useNodeBalancerQuery } from '@linode/queries';

import { SummaryPanel } from './SummaryPanel';
import { TablesPanel } from './TablesPanel';

export const NodeBalancerSummary = () => {
  const { nodeBalancerId } = useParams<{ nodeBalancerId: string }>();
  const id = Number(nodeBalancerId);
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
  '/nodebalancers/$nodeBalancerId'
)({
  component: NodeBalancerSummary,
});
