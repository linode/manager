import { useImageQuery, useRegionsQuery, useTypeQuery } from '@linode/queries';
import { FormControlLabel, Radio } from '@linode/ui';
import { formatStorageUnits, getFormattedStatus } from '@linode/utilities';
import React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { getLinodeIconStatus } from 'src/features/Linodes/LinodesLanding/utils';

import type { Linode } from '@linode/api-v4';

interface Props {
  linode: Linode;
  onPowerOff?: () => void;
  onSelect: () => void;
  selected: boolean;
}

export const LinodeSelectTableRow = (props: Props) => {
  const { linode, onPowerOff, onSelect, selected } = props;

  const { data: image } = useImageQuery(
    linode.image ?? '',
    Boolean(linode.image)
  );

  const { data: regions } = useRegionsQuery();

  const { data: type } = useTypeQuery(linode.type ?? '', Boolean(linode.type));

  const region = regions?.find((r) => r.id === linode.region);

  const { data: accountPermissions } = usePermissions('account', [
    'create_linode',
  ]);

  const { data: permissions } = usePermissions(
    'linode',
    ['shutdown_linode', 'clone_linode'],
    linode.id
  );

  return (
    <TableRow disabled={!permissions.clone_linode} key={linode.label}>
      <TableCell>
        <FormControlLabel
          checked={selected}
          control={<Radio />}
          disabled={
            !permissions.clone_linode || !accountPermissions?.create_linode
          }
          label={linode.label}
          onChange={onSelect}
          sx={{ gap: 2 }}
        />
      </TableCell>
      <TableCell statusCell>
        <StatusIcon status={getLinodeIconStatus(linode.status)} />
        {getFormattedStatus(linode.status)}
      </TableCell>
      <TableCell>{image?.label ?? linode.image}</TableCell>
      <TableCell>
        {type?.label ? formatStorageUnits(type.label) : linode.type}
      </TableCell>
      <TableCell>{region?.label ?? linode.region}</TableCell>
      {onPowerOff && (
        <TableCell actionCell>
          {selected && linode.status !== 'offline' && (
            <InlineMenuAction
              actionText="Power Off"
              buttonHeight={43}
              disabled={!permissions.shutdown_linode}
              onClick={onPowerOff}
            />
          )}
        </TableCell>
      )}
    </TableRow>
  );
};
