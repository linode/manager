import { useNodeBalancerQuery } from '@linode/queries';
import { Box, Stack } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { EntityDetail } from 'src/components/EntityDetail/EntityDetail';

import { NodeBalancerDetailBody } from './NodeBalancerDetailBody';
import { NodeBalancerDetailFooter } from './NodeBalancerDetailFooter';
import { NodeBalancerDetailHeader } from './NodeBalancerDetailHeader';

export const SummaryPanel = () => {
  const { id } = useParams({ from: '/nodebalancers/$id/summary' });
  const { data: nodebalancer } = useNodeBalancerQuery(Number(id), Boolean(id));

  if (!nodebalancer) return null;

  return (
    <Stack spacing={2}>
      <Box>
        <EntityDetail
          body={<NodeBalancerDetailBody nodebalancer={nodebalancer} />}
          footer={<NodeBalancerDetailFooter nodebalancer={nodebalancer} />}
          header={<NodeBalancerDetailHeader />}
        />
      </Box>
    </Stack>
  );
};
