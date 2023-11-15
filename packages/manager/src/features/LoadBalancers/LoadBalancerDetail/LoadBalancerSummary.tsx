import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';
import { useParams } from 'react-router-dom';

import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { IPAddress } from 'src/features/Linodes/LinodesLanding/IPAddress';
import { useLoadBalancerQuery } from 'src/queries/aglb/loadbalancers';
import { useRegionsQuery } from 'src/queries/regions';

import { Ports } from '../LoadBalancerLanding/Ports';
import { Stack } from 'src/components/Stack';

export const LoadBalancerSummary = () => {
  const { loadbalancerId } = useParams<{ loadbalancerId: string }>();

  const id = Number(loadbalancerId);

  const { data: loadbalancer } = useLoadBalancerQuery(id);
  const { data: regions } = useRegionsQuery();

  const items = [
    {
      title: 'Hostname',
      value: (
        <Typography>
          <IPAddress ips={[loadbalancer?.hostname ?? '']} isHovered />
        </Typography>
      ),
    },
    {
      title: 'Ports',
      value: <Ports loadbalancerId={id} />,
    },
    {
      title: 'Regions',
      value: (
        <Typography>
          {loadbalancer?.regions
            .map((region) => regions?.find((r) => r.id === region)?.label)
            .join(', ')}
        </Typography>
      ),
    },
    {
      title: 'Load Balancer ID',
      value: <Typography>{loadbalancer?.id}</Typography>,
    },
  ];

  return (
    <Paper sx={{ paddingY: 2.5 }}>
      <Grid columns={{ lg: 12, md: 8, sm: 4, xs: 1 }} container spacing={1.5}>
        {items.map(({ title, value }) => (
          <Grid key={title} md={4} sm={4} xs={2}>
            <Stack direction="row" spacing={2}>
              <Typography minWidth="75px" noWrap>
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
