import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import { useFormikContext } from 'formik';
import * as React from 'react';

import { DisplayPrice } from 'src/components/DisplayPrice';
import { Divider } from 'src/components/Divider';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';

import { EditLoadBalancerConfigurations } from './EditLoadBalancerConfigurations';
import { EditLoadBalancerLabel } from './EditLoadBalancerLabel';
import { EditLoadBalancerRegions } from './EditLoadBalancerRegions';
import {
  StyledButton,
  StyledMainGridItem,
  StyledSidebarGridItem,
} from './LoadBalancerSummary.styles';

import type { LoadBalancerCreateFormData } from '../LoadBalancerCreateFormWrapper';

export const LoadBalancerSummary = () => {
  const { errors } = useFormikContext<LoadBalancerCreateFormData>();

  return (
    <div>
      <DocumentTitleSegment segment="Load Balancer Summary" />
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: 'Global Load Balancers',
              position: 1,
            },
            {
              label: 'Create',
              position: 2,
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
            <EditLoadBalancerConfigurations />
          </Stack>
        </StyledMainGridItem>
        <StyledSidebarGridItem lg={3} md={4} xs={12}>
          <Stack spacing={3}>
            <Typography variant="h2">Billing Summary</Typography>
            <Divider dark />
            <Stack spacing={1}>
              <Typography variant="body1">Regions (5)</Typography>
              <div>
                {/* // TODO AGLB: Implement Pricing */}
                <DisplayPrice interval="mo" price={60} />
              </div>
            </Stack>

            <Divider dark />
            <div>
              {/* // TODO AGLB: Implement Pricing */}
              <DisplayPrice interval="hour" price={2} />
            </div>
            <Divider dark />
            <Notice important variant="warning">
              <Typography>
                Upload and apply certificates after LB creation.
                <Link to="#">Learn more</Link>.
              </Typography>
            </Notice>
          </Stack>
          <StyledButton
            buttonType="primary"
            disabled={Object.keys(errors)?.length > 0}
            onClick={() => null}
          >
            Create Load Balancer
          </StyledButton>
        </StyledSidebarGridItem>
      </Grid>
    </div>
  );
};
