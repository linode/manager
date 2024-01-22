import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useNodeBalancerQuery } from 'src/queries/nodebalancers';

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
        <StyledMainGridItem lg={9} md={8} xs={12}>
          <TablesPanel />
        </StyledMainGridItem>
        <StyledSidebarGridItem lg={3} md={4} xs={12}>
          <SummaryPanel />
        </StyledSidebarGridItem>
      </Grid>
    </div>
  );
};

const StyledMainGridItem = styled(Grid, {
  label: 'StyledMainGridItem',
})(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    order: 1,
  },
}));

const StyledSidebarGridItem = styled(Grid, {
  label: 'StyledSidebarGridItem',
})(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    order: 2,
  },
}));
