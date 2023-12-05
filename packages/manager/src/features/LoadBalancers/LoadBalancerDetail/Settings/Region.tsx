import { useFormik } from 'formik';
import React from 'react';

import { BetaChip } from 'src/components/BetaChip/BetaChip';
import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import {
  useLoadBalancerMutation,
  useLoadBalancerQuery,
} from 'src/queries/aglb/loadbalancers';

import { LoadBalancerRegions } from '../LoadBalancerRegions';

interface Props {
  loadbalancerId: number;
}

export const Region = ({ loadbalancerId }: Props) => {
  const { data: loadbalancer } = useLoadBalancerQuery(loadbalancerId);
  const { mutateAsync } = useLoadBalancerMutation(loadbalancerId);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      regions: loadbalancer?.regions,
    },
    async onSubmit(values) {
      await mutateAsync(values);
    },
  });

  return (
    <Paper>
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={1.5}>
          <Typography variant="h2">Regions</Typography>
          <Typography>
            <BetaChip
              component="span"
              sx={{ marginLeft: '0 !important', marginRight: '8px !important' }}
            />{' '}
            Load Balancer regions can not be changed during beta.
          </Typography>
          <LoadBalancerRegions />
        </Stack>
      </form>
    </Paper>
  );
};
