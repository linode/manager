import Stack from '@mui/material/Stack';
import React from 'react';
import { useParams } from 'react-router-dom';

import { Paper } from 'src/components/Paper';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { Typography } from 'src/components/Typography';
import { useLoadBalancerQuery } from 'src/queries/aglb/loadbalancers';

export const LoadBalancerSummary = () => {
  const { loadbalancerId } = useParams<{ loadbalancerId: string }>();

  const id = Number(loadbalancerId);

  const { data: loadbalancer } = useLoadBalancerQuery(id);

  return (
    <Paper>
      <Stack direction="row" spacing={4}>
        <Stack>
          <Stack alignItems="center" direction="row" spacing={2}>
            <Typography>
              <b>Endpoint Health:</b>
            </Typography>
            <StatusIcon status="active" /> 4 up - <StatusIcon status="error" />{' '}
            6 down
          </Stack>
        </Stack>
        <Stack>
          <Stack alignItems="center" direction="row" spacing={2}>
            <Typography>
              <b>Hostname:</b>
            </Typography>
            <Typography>{loadbalancer?.hostname}</Typography>
          </Stack>
        </Stack>
        <Stack></Stack>
      </Stack>
    </Paper>
  );
};
