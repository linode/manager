import { Chip, Stack } from '@linode/ui';
import React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import { useMakeIPv4Primary } from './utilities';

interface Props {
  address: string;
  interfaceId: number;
  linodeId: number;
  onDelete: () => void;
  primary: boolean;
}

export const IPv4AddressRow = (props: Props) => {
  const { address, interfaceId, linodeId, onDelete, primary } = props;

  const { isPending, onMakePrimary } = useMakeIPv4Primary({
    interfaceId,
    linodeId,
  });

  return (
    <TableRow key={address}>
      <TableCell>
        <Stack alignItems="center" direction="row" gap={1.5}>
          {address}
          {primary && <Chip color="primary" label="Primary" />}
        </Stack>
      </TableCell>
      <TableCell actionCell>
        <InlineMenuAction
          actionText="Make Primary"
          disabled={primary}
          loading={isPending}
          onClick={() => onMakePrimary(address)}
        />
        <InlineMenuAction actionText="Delete" onClick={onDelete} />
      </TableCell>
    </TableRow>
  );
};
