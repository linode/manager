import { Stack } from 'src/components/Stack';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { useLoadBalancerQuery } from 'src/queries/aglb/loadbalancers';

import { DeleteLoadBalancerDialog } from './LoadBalancerDeleteDialog';

interface Props {
  loadbalancerId: number;
}

export const Delete = ({ loadbalancerId }: Props) => {
  const history = useHistory();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: loadbalancer } = useLoadBalancerQuery(loadbalancerId);

  return (
    <Paper>
      <Stack spacing={1}>
        <Typography variant="h2">Delete Load Balancer</Typography>
        <Box>
          <Button
            buttonType="primary"
            onClick={() => setIsDeleteDialogOpen(true)}
            type="submit"
          >
            Delete
          </Button>
        </Box>
      </Stack>
      <DeleteLoadBalancerDialog
        loadbalancer={loadbalancer}
        onClose={() => setIsDeleteDialogOpen(false)}
        onSuccess={() => history.replace('/loadbalancers')}
        open={isDeleteDialogOpen}
      />
    </Paper>
  );
};
