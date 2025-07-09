import { useImageQuery, useRegionsQuery, useTypeQuery } from '@linode/queries';
import { FormControlLabel, Radio } from '@linode/ui';
import { formatStorageUnits } from '@linode/utilities';
import React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import { LinodeStatus } from '../../LinodesLanding/LinodeRow/LinodeStatus';

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
      <TableCell>
        <LinodeStatus linodeId={linode.id} linodeStatus={linode.status} />
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
