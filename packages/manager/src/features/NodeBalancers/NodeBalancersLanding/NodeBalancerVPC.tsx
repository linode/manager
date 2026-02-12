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
  // but we only want to display the backend configs.
  const nbBackendVpcConfigs =
    vpcConfig?.data.filter((v) => v.purpose === 'backend') ?? [];

  const { data: vpcDetails, isLoading: isVPCDetailsLoading } = useVPCQuery(
    Number(nbBackendVpcConfigs[0]?.vpc_id),
    Boolean(nbBackendVpcConfigs[0]?.vpc_id)
  );

  if (isVPCConfigLoading || isVPCDetailsLoading) {
    return <Skeleton />;
  }

  if (nbBackendVpcConfigs.length === 0) {
    return 'None';
  }

  return nbBackendVpcConfigs.map((vpc, i) => (
    <React.Fragment key={vpc?.id}>
      <Link
        accessibleAriaLabel={`NodeBalancer Port ${vpc?.id}`}
        to={`/vpcs/${vpc?.id}`}
      >
        {vpcDetails?.label}
      </Link>
      {i < nbBackendVpcConfigs.length - 1 ? ', ' : ''}
    </React.Fragment>
  ));
};
