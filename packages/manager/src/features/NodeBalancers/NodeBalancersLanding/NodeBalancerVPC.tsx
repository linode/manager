import {
  useNodeBalancerVPCConfigsBetaQuery,
  useVPCQuery,
} from '@linode/queries';
import React from 'react';

import { Link } from 'src/components/Link';
import { Skeleton } from 'src/components/Skeleton';

interface Props {
  nodeBalancerId: number;
}

export const NodeBalancerVPC = ({ nodeBalancerId }: Props) => {
  const { data: vpcConfig, isLoading: isVPCConfigLoading } =
    useNodeBalancerVPCConfigsBetaQuery(nodeBalancerId, Boolean(nodeBalancerId));

  const { data: vpcDetails, isLoading: isVPCDetailsLoading } = useVPCQuery(
    Number(vpcConfig?.data[0]?.vpc_id),
    Boolean(vpcConfig?.data[0]?.vpc_id)
  );

  if (isVPCConfigLoading || isVPCDetailsLoading) {
    return <Skeleton />;
  }

  if (vpcConfig?.data?.length === 0) {
    return 'None';
  }

  return vpcConfig?.data.map(({ vpc_id: vpcId }, i) => (
    <React.Fragment key={vpcId}>
      <Link
        accessibleAriaLabel={`NodeBalancer Port ${vpcId}`}
        to={`/vpcs/${vpcId}`}
      >
        {vpcDetails?.label}
      </Link>
      {i < vpcConfig.data.length - 1 ? ', ' : ''}
    </React.Fragment>
  ));
};
