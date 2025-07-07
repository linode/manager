import { useRegionsQuery } from '@linode/queries';
import { Hidden } from '@linode/ui';
import * as React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { LKE_ENTERPRISE_VPC_WARNING } from 'src/features/Kubernetes/constants';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';

import {
  getIsVPCLKEEnterpriseCluster,
  getUniqueLinodesFromSubnets,
  getUniqueResourcesFromSubnets,
} from '../utils';

import type { VPC } from '@linode/api-v4/lib/vpcs/types';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  handleDeleteVPC: () => void;
  handleEditVPC: () => void;
  isNodebalancerVPCEnabled: boolean;
  vpc: VPC;
}

export const VPCRow = ({
  handleDeleteVPC,
  handleEditVPC,
  isNodebalancerVPCEnabled,
  vpc,
}: Props) => {
  const { id, label, subnets } = vpc;
  const { data: regions } = useRegionsQuery();

  const regionLabel = regions?.find((r) => r.id === vpc.region)?.label ?? '';
  const numResources = isNodebalancerVPCEnabled
    ? getUniqueResourcesFromSubnets(vpc.subnets)
    : getUniqueLinodesFromSubnets(vpc.subnets);

  const isVPCReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'vpc',
    id: vpc.id,
  });

  const isVPCLKEEnterpriseCluster = getIsVPCLKEEnterpriseCluster(vpc);

  const actions: Action[] = [
    {
      disabled: isVPCReadOnly || isVPCLKEEnterpriseCluster,
      onClick: handleEditVPC,
      title: 'Edit',
      tooltip: isVPCReadOnly
        ? getRestrictedResourceText({
            action: 'edit',
            isSingular: true,
            resourceType: 'VPCs',
          })
        : isVPCLKEEnterpriseCluster
          ? LKE_ENTERPRISE_VPC_WARNING
          : undefined,
    },
    {
      disabled: isVPCReadOnly || isVPCLKEEnterpriseCluster,
      onClick: handleDeleteVPC,
      title: 'Delete',
      tooltip: isVPCReadOnly
        ? getRestrictedResourceText({
            action: 'delete',
            isSingular: true,
            resourceType: 'VPCs',
          })
        : isVPCLKEEnterpriseCluster
          ? LKE_ENTERPRISE_VPC_WARNING
          : undefined,
    },
  ];

  return (
    <TableRow data-qa-vpc-id={id} key={`vpc-row-${id}`}>
      <TableCell>
        <Link to={`/vpcs/${id}`}>{label}</Link>
      </TableCell>
      <Hidden smDown>
        <TableCell>{regionLabel}</TableCell>
      </Hidden>
      <Hidden mdDown>
        <TableCell>{id}</TableCell>
      </Hidden>
      <TableCell>{subnets.length}</TableCell>
      <Hidden mdDown>
        <TableCell>{numResources}</TableCell>
      </Hidden>
      <TableCell actionCell>
        {actions.map((action) => (
          <InlineMenuAction
            actionText={action.title}
            data-testid={action.title}
            disabled={action.disabled}
            key={action.title}
            onClick={action.onClick}
            tooltip={action.tooltip}
          />
        ))}
      </TableCell>
    </TableRow>
  );
};
