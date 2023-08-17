import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';
import { useParams } from 'react-router-dom';

import { Paper } from 'src/components/Paper';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { Typography } from 'src/components/Typography';
import { IPAddress } from 'src/features/Linodes/LinodesLanding/IPAddress';
import { useLoadBalancerConfigurationsQuery } from 'src/queries/aglb/configurations';
import { useLoadBalancerQuery } from 'src/queries/aglb/loadbalancers';
import { useRegionsQuery } from 'src/queries/regions';

export const LoadBalancerSummary = () => {
  const { loadbalancerId } = useParams<{ loadbalancerId: string }>();

  const id = Number(loadbalancerId);

  const { data: loadbalancer } = useLoadBalancerQuery(id);
  const { data: configurations } = useLoadBalancerConfigurationsQuery(id);
  const { data: regions } = useRegionsQuery();

  const ports = configurations?.data.map((config) => config.port);

  const items = [
    {
      title: 'Endpoint Health',
      value: (
        <Stack alignItems="center" direction="row" spacing={1}>
          <StatusIcon status="active" />
          <Typography>4 up</Typography>
          <Typography>&mdash;</Typography>
          <StatusIcon status="error" />
          <Typography>6 down</Typography>
        </Stack>
      ),
    },

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
      value: <Typography>{ports?.join(', ')}</Typography>,
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
      title: 'Logs',
      value: (
        <Typography>
          <IPAddress ips={[loadbalancer?.hostname ?? '']} isHovered />
        </Typography>
      ),
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
