import * as React from 'react';
import { Link } from 'react-router-dom';

import { Hidden } from 'src/components/Hidden';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { useIsGeckoEnabled } from 'src/components/RegionSelect/RegionSelect.utils';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useRegionsQuery } from 'src/queries/regions/regions';

import type { VPC } from '@linode/api-v4/lib/vpcs/types';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  handleDeleteVPC: () => void;
  handleEditVPC: () => void;
  vpc: VPC;
}

export const VPCRow = ({ handleDeleteVPC, handleEditVPC, vpc }: Props) => {
  const { id, label, subnets } = vpc;
  const { isGeckoGAEnabled } = useIsGeckoEnabled();
  const { data: regions } = useRegionsQuery({
    transformRegionLabel: isGeckoGAEnabled,
  });

  const regionLabel = regions?.find((r) => r.id === vpc.region)?.label ?? '';
  const numLinodes = subnets.reduce(
    (acc, subnet) => acc + subnet.linodes.length,
    0
  );

  const actions: Action[] = [
    {
      onClick: handleEditVPC,
      title: 'Edit',
    },
    {
      onClick: handleDeleteVPC,
      title: 'Delete',
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
            key={action.title}
            onClick={action.onClick}
          />
        ))}
      </TableCell>
    </TableRow>
  );
};
