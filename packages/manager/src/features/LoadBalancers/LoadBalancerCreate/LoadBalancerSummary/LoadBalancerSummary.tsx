import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';

import { EditLoadBalancerLabel } from './EditLoadBalancerLabel';
import { EditLoadBalancerRegions } from './EditLoadBalancerRegions';
import {
  StyledMainGridItem,
  StyledSidebarGridItem,
} from './LoadBalancerSummary.styles';

export const LoadBalancerSummary = () => {
  return (
    <div>
      <DocumentTitleSegment segment="Load Balancer Summary" />
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: 'Create',
              position: 1,
            },
          ],
          pathname: location.pathname,
        }}
        title="Summary"
      />
      <Grid container spacing={2}>
        <StyledMainGridItem lg={9} md={8} xs={12}>
          <Stack spacing={3}>
            <EditLoadBalancerLabel />
            <EditLoadBalancerRegions />
          </Stack>
        </StyledMainGridItem>
        <StyledSidebarGridItem lg={3} md={4} xs={12}>
          <p>Right side content</p>
        </StyledSidebarGridItem>
      </Grid>
    </div>
  );
};
