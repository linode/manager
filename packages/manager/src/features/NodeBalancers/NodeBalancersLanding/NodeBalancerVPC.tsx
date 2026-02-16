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

  // NodeBalancerVPCConfigsBetaQuery returns both frontend and backend VPC configs,
  // but we only want to display the backend configs and
  // a nodebalancer can have only one backend VPC.
  const nbBackendVpcConfig =
    vpcConfig?.data.filter((v) => v.purpose === 'backend')[0] ?? null;

  const { data: vpcDetails, isLoading: isVPCDetailsLoading } = useVPCQuery(
    Number(nbBackendVpcConfig?.vpc_id),
    Boolean(nbBackendVpcConfig?.vpc_id)
  );

  if (isVPCConfigLoading || isVPCDetailsLoading) {
    return <Skeleton />;
  }

  if (!nbBackendVpcConfig) {
    return 'None';
  }

  return (
    <React.Fragment key={nbBackendVpcConfig?.id}>
      <Link
        accessibleAriaLabel={`VPC ${nbBackendVpcConfig?.vpc_id}`}
        to={`/vpcs/${nbBackendVpcConfig?.vpc_id}`}
      >
        {vpcDetails?.label}
      </Link>
    </React.Fragment>
  );
};
