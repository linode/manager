import { useNodeBalancerQuery } from '@linode/queries';
import Grid from '@mui/material/Grid';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';

import { SummaryPanel } from './SummaryPanel';

export const NodeBalancerSummaryV2 = () => {
  const { id } = useParams({
    from: '/nodebalancers/$id/summary',
  });
  const { data: nodebalancer } = useNodeBalancerQuery(Number(id), Boolean(id));

  return (
    <div>
      <DocumentTitleSegment segment={`${nodebalancer?.label} - Summary`} />
      <Grid>
        <SummaryPanel />
      </Grid>
    </div>
  );
};
