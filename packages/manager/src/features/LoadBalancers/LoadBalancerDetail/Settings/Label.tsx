import { Stack } from 'src/components/Stack';
import { useFormik } from 'formik';
import React from 'react';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Paper } from 'src/components/Paper';
import { TextField } from 'src/components/TextField';
import {
  useLoadBalancerMutation,
  useLoadBalancerQuery,
} from 'src/queries/aglb/loadbalancers';

interface Props {
  loadbalancerId: number;
}

export const Label = ({ loadbalancerId }: Props) => {
  const { data: loadbalancer } = useLoadBalancerQuery(loadbalancerId);
  const { error, isLoading, mutateAsync } = useLoadBalancerMutation(
    loadbalancerId
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      label: loadbalancer?.label,
    },
    async onSubmit(values) {
      await mutateAsync(values);
    },
  });

  return (
    <Paper>
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={1}>
          <TextField
            errorText={error?.[0].reason}
            label="Load Balancer Label"
            name="label"
            noMarginTop
            onChange={formik.handleChange}
            value={formik.values.label}
          />
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
