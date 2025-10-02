import { useRegionsQuery } from '@linode/queries';
import { Hidden } from '@linode/ui';
import * as React from 'react';

import { type Action, ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import {
  getUniqueLinodesFromSubnets,
  getUniqueResourcesFromSubnets,
} from '../utils';

import type { VPC } from '@linode/api-v4/lib/vpcs/types';

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

  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const regionLabel = regions?.find((r) => r.id === vpc.region)?.label ?? '';
  const numResources = isNodebalancerVPCEnabled
    ? getUniqueResourcesFromSubnets(vpc.subnets)
    : getUniqueLinodesFromSubnets(vpc.subnets);

  const { data: permissions, isLoading } = usePermissions(
    'vpc',
    ['update_vpc', 'delete_vpc'],
    vpc.id,
    isOpen
  );

  const actions: Action[] = [
    {
      disabled: !permissions.update_vpc,
      onClick: handleEditVPC,
      title: 'Edit',
      tooltip: !permissions.update_vpc
        ? getRestrictedResourceText({
            action: 'edit',
            isSingular: true,
            resourceType: 'VPCs',
          })
        : undefined,
    },
    {
      disabled: !permissions.delete_vpc,
      onClick: handleDeleteVPC,
      title: 'Delete',
      tooltip: !permissions.delete_vpc
        ? getRestrictedResourceText({
            action: 'delete',
            isSingular: true,
            resourceType: 'VPCs',
          })
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
        <ActionMenu
          actionsList={actions}
          ariaLabel={`Action menu for VPC ${vpc.label}`}
          loading={isLoading}
          onOpen={() => setIsOpen(true)}
        />
      </TableCell>
    </TableRow>
  );
};
