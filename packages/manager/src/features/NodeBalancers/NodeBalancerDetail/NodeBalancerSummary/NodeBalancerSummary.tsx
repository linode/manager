import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import TablesPanel from './TablesPanel';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { styled } from '@mui/material/styles';
import { SummaryPanel } from './SummaryPanel';
import { useNodeBalancerQuery } from 'src/queries/nodebalancers';
import { useParams } from 'react-router-dom';

export const NodeBalancerSummary = () => {
  const { nodeBalancerId } = useParams<{ nodeBalancerId: string }>();
  const id = Number(nodeBalancerId);
  const { data: nodebalancer } = useNodeBalancerQuery(id);

  return (
    <div>
      <DocumentTitleSegment segment={`${nodebalancer?.label} - Summary`} />
      <Grid container spacing={2}>
        <StyledMainGridItem xs={12} md={8} lg={9}>
          <TablesPanel />
        </StyledMainGridItem>
        <StyledSidebarGridItem xs={12} md={4} lg={3}>
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
