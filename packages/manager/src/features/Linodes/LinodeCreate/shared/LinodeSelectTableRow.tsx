import { FormControlLabel, Radio } from '@linode/ui';
import { capitalize, formatStorageUnits } from '@linode/utilities';
import React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { getLinodeIconStatus } from 'src/features/Linodes/LinodesLanding/utils';
import { useImageQuery } from 'src/queries/images';
import { useRegionsQuery } from '@linode/queries';
import { useTypeQuery } from 'src/queries/types';

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

  return (
    <TableRow key={linode.label}>
      <TableCell>
        <FormControlLabel
          checked={selected}
          control={<Radio />}
          label={linode.label}
          onChange={onSelect}
          sx={{ gap: 2 }}
        />
      </TableCell>
      <TableCell statusCell>
        <StatusIcon status={getLinodeIconStatus(linode.status)} />
        {capitalize(linode.status.replace('_', ' '))}
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
              onClick={onPowerOff}
            />
          )}
        </TableCell>
      )}
    </TableRow>
  );
};
