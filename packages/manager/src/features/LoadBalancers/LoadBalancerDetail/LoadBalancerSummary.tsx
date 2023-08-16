import Stack from '@mui/material/Stack';
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

  return (
    <Paper>
      <Stack
        columnGap={4}
        direction="row"
        flexWrap="wrap"
        justifyContent="space-between"
        rowGap={3}
      >
        <Stack>
          <Stack alignItems="center" direction="row" spacing={1}>
            <Typography mr={2}>
              <b>Endpoint Health</b>
            </Typography>
            <StatusIcon status="active" />
            <Typography>4 up</Typography>
            <Typography>&mdash;</Typography>
            <StatusIcon status="error" />
            <Typography>6 down</Typography>
          </Stack>
        </Stack>
        <Stack spacing={2}>
          <Stack alignItems="center" direction="row" spacing={2}>
            <Typography minWidth="75px">
              <b>Hostname</b>
            </Typography>
            <Typography>
              <IPAddress ips={[loadbalancer?.hostname ?? '']} isHovered />
            </Typography>
          </Stack>
          <Stack alignItems="center" direction="row" spacing={2}>
            <Typography minWidth="75px">
              <b>Ports</b>
            </Typography>
            <Typography>{ports?.join(', ')}</Typography>
          </Stack>
          <Stack alignItems="center" direction="row" spacing={2}>
            <Typography minWidth="75px">
              <b>Regions</b>
            </Typography>
            <Typography>
              {loadbalancer?.regions
                .map((region) => regions?.find((r) => r.id === region)?.label)
                .join(', ')}
            </Typography>
          </Stack>
        </Stack>
        <Stack>
          <Stack alignItems="center" direction="row" spacing={2}>
            <Typography minWidth="75px">
              <b>Logs</b>
            </Typography>
            <Typography>
              <IPAddress ips={[loadbalancer?.hostname ?? '']} isHovered />
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
};
