import React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

interface Props {
  onRemove: () => void;
  range: string;
}

export const IPv6RangeRow = (props: Props) => {
  const { onRemove, range } = props;

  return (
    <TableRow key={range}>
      <TableCell>
        {range === '/56' || range === '/64' ? (
          <i>{range} range allocated on save</i>
        ) : (
          range
        )}
      </TableCell>
      <TableCell actionCell>
        <InlineMenuAction actionText="Remove" onClick={onRemove} />
      </TableCell>
    </TableRow>
  );
};
