import {
  useNodeBalancerQuery,
  useNodeBalancerVPCConfigsBetaQuery,
} from '@linode/queries';
import { CircleProgress, ErrorState } from '@linode/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMatchRoute, useParams } from '@tanstack/react-router';
import React from 'react';

import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import { useIsNodebalancerVPCEnabled } from '../utils';
import { NodeBalancerConfigurations } from './NodeBalancerConfigurations';
import { getConfigsWithNodes, getConfigsWithNodesBeta } from './requests';

import type { ConfigsWithNodes } from './requests';
import type { APIError } from '@linode/api-v4';

export const NodeBalancerConfigurationsWrapper = () => {
  const queryClient = useQueryClient();

  const matchRoute = useMatchRoute();

  const routeParams = useParams({ from: '/nodebalancers/$id/configurations' });
  const nodeBalancerId = routeParams.id;

  const configParams = matchRoute({
    to: '/nodebalancers/$id/configurations/$configId',
    fuzzy: false,
  });

  const configId = configParams !== false ? configParams.configId : undefined;

  const { data: permissions } = usePermissions(
    'nodebalancer',
    [
      'update_nodebalancer',
      'delete_nodebalancer',
      'create_nodebalancer_config',
    ],
    Number(nodeBalancerId)
  );

  const { data: nodeBalancer } = useNodeBalancerQuery(+nodeBalancerId);
  const { isNodebalancerVPCEnabled } = useIsNodebalancerVPCEnabled();

  const { data: vpcConfigData } = useNodeBalancerVPCConfigsBetaQuery(
    Number(nodeBalancerId),
    isNodebalancerVPCEnabled && nodeBalancerId !== undefined
  );

  const nodeBalancerVpcId = vpcConfigData?.data?.[0]?.vpc_id;
  const nodeBalancerSubnetId = vpcConfigData?.data?.[0]?.subnet_id;

  const getConfigNodesFn = isNodebalancerVPCEnabled
    ? getConfigsWithNodesBeta
    : getConfigsWithNodes;

  const { data, isPending, error } = useQuery<ConfigsWithNodes, APIError[]>({
    queryKey: ['nodebalancers', nodeBalancerId, 'configs-with-nodes'],
    queryFn: () => getConfigNodesFn(+nodeBalancerId),
    /**
     * Don't ever cache this query to match old behavior. When we rewrite NodeBalancerConfigurations we will change this.
     */
    gcTime: 0,
  });

  if (isPending) {
    return <CircleProgress />;
  }

  if (error) {
    return <ErrorState errorText={error[0].reason} />;
  }

  return (
    <NodeBalancerConfigurations
      configId={configId ? +configId : undefined}
      configs={data}
      nodeBalancerId={+nodeBalancerId}
      nodeBalancerLabel={nodeBalancer?.label ?? ''}
      nodeBalancerRegion={nodeBalancer?.region ?? ''}
      nodeBalancerSubnetId={nodeBalancerSubnetId}
      nodeBalancerVpcId={nodeBalancerVpcId}
      permissions={permissions}
      queryClient={queryClient}
    />
  );
};
