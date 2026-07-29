import { useNodeBalancerBetaQuery } from '@linode/queries';
import { Box, Stack } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { EntityDetail } from 'src/components/EntityDetail/EntityDetail';

import { BackendConfigurationVPC } from './BackendConfigVPC';
import { BackendIPConfiguration } from './BackendIPConfiguration';
import { FrontendConfiguration } from './FrontendConfiguration';
import { LKEClusterInfo } from './LKEClusterInfo';
import { NodeBalancerDetailBody } from './NodeBalancerDetailBody';
import { NodeBalancerDetailFooter } from './NodeBalancerDetailFooter';
import { NodeBalancerDetailHeader } from './NodeBalancerDetailHeader';

export const SummaryPanel = () => {
  const { id } = useParams({ from: '/nodebalancers/$id/summary' });

  const { data: nodebalancer } = useNodeBalancerBetaQuery(
    Number(id),
    Boolean(id)
  );

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
      <LKEClusterInfo nodebalancer={nodebalancer} />
      <FrontendConfiguration nodebalancer={nodebalancer} />
      {nodebalancer.backend_connectivity === 'vpc' && (
        <BackendConfigurationVPC />
      )}
      {(nodebalancer.backend_connectivity === 'ipv6' ||
        nodebalancer.backend_connectivity === 'legacy') && (
        <BackendIPConfiguration nodebalancer={nodebalancer} />
      )}
    </Stack>
  );
};
