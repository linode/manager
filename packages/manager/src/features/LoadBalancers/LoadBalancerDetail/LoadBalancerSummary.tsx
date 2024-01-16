import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';
import { useParams } from 'react-router-dom';

import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { IPAddress } from 'src/features/Linodes/LinodesLanding/IPAddress';
import { useLoadBalancerQuery } from 'src/queries/aglb/loadbalancers';
// import { useRegionsQuery } from 'src/queries/regions';

import { Ports } from '../LoadBalancerLanding/Ports';
import { LoadBalancerEndpointHealth } from './LoadBalancerEndpointHealth';
import { LoadBalancerRegions } from './LoadBalancerRegions';

export const LoadBalancerSummary = () => {
  const { loadbalancerId } = useParams<{ loadbalancerId: string }>();

  const id = Number(loadbalancerId);

  const { data: loadbalancer } = useLoadBalancerQuery(id);
  // const { data: regions } = useRegionsQuery();

  const items = [
    {
      title: 'Hostname',
      value: loadbalancer?.hostname ? (
        <IPAddress ips={[loadbalancer.hostname]} isHovered />
      ) : (
        <Typography>None</Typography>
      ),
    },
    {
      title: 'Load Balancer ID',
      value: <Typography>{loadbalancer?.id}</Typography>,
    },
    {
      title: 'Ports',
      value: <Ports loadbalancerId={id} />,
    },
    {
      title: 'Endpoints',
      value: <LoadBalancerEndpointHealth id={id} />,
    },
    {
      title: 'Regions',
      value: <LoadBalancerRegions />,
      // Uncomment the line below to show the regions returned by the API.
      // value: (
      //   <Typography>
      //     {loadbalancer?.regions
      //       .map((region) => regions?.find((r) => r.id === region)?.label)
      //       .join(', ')}
      //   </Typography>
      // ),
    },
  ];

  return (
    <Paper sx={{ paddingY: 2.5 }}>
      <Grid columns={{ lg: 12, md: 8, sm: 4, xs: 1 }} container spacing={1.5}>
        {items.map(({ title, value }) => (
          <Grid key={title} md={4} sm={4} xs={2}>
            <Stack direction="row" spacing={2}>
              <Typography minWidth="70px" noWrap>
                <strong>{title}</strong>
              </Typography>
              {value}
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};
