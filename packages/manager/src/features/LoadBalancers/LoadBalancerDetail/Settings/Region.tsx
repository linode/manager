import Stack from '@mui/material/Stack';
import { useFormik } from 'formik';
import React from 'react';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import {
  useLoadBalancerMutation,
  useLoadBalancerQuery,
} from 'src/queries/aglb/loadbalancers';

interface Props {
  loadbalancerId: number;
}

export const Region = ({ loadbalancerId }: Props) => {
  const { data: loadbalancer } = useLoadBalancerQuery(loadbalancerId);
  const { isLoading, mutateAsync } = useLoadBalancerMutation(loadbalancerId);

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
        <Stack spacing={1}>
          <Typography variant="h2">Regions</Typography>
          <Typography>Select regions for your Load Balancer.</Typography>
          <Box>
            <Button buttonType="primary" loading={isLoading} type="submit">
              Save
            </Button>
          </Box>
        </Stack>
      </form>
    </Paper>
  );
};
