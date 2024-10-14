import { VPC } from '@linode/api-v4/lib/vpcs/types';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { Action } from 'src/components/ActionMenu/ActionMenu';
import { Hidden } from 'src/components/Hidden';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';

interface Props {
  handleDeleteVPC: () => void;
  handleEditVPC: () => void;
  vpc: VPC;
}

export const VPCRow = ({ handleDeleteVPC, handleEditVPC, vpc }: Props) => {
  const { id, label, subnets } = vpc;
  const { data: regions } = useRegionsQuery();

  const regionLabel = regions?.find((r) => r.id === vpc.region)?.label ?? '';
  const numLinodes = subnets.reduce(
    (acc, subnet) => acc + subnet.linodes.length,
    0
  );

  const isVPCReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'vpc',
    id: vpc.id,
  });

  const actions: Action[] = [
    {
      onClick: handleEditVPC,
      title: 'Edit',
      disabled: isVPCReadOnly,
      tooltip: isVPCReadOnly
        ? getRestrictedResourceText({
            action: 'edit',
            isSingular: true,
            resourceType: 'VPCs',
          })
        : undefined,
    },
    {
      onClick: handleDeleteVPC,
      title: 'Delete',
      disabled: isVPCReadOnly,
      tooltip: isVPCReadOnly
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
        <TableCell>{numLinodes}</TableCell>
      </Hidden>
      <TableCell actionCell>
        {actions.map((action) => (
          <InlineMenuAction
            actionText={action.title}
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
