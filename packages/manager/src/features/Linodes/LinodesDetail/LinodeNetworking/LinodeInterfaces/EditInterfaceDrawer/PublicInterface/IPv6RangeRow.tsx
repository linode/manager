import React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

interface Props {
  onDelete: () => void;
  range: string;
}

export const IPv6RangeRow = (props: Props) => {
  const { onDelete, range } = props;

  return (
    <TableRow key={range}>
      <TableCell>{range}</TableCell>
      <TableCell actionCell>
        <InlineMenuAction actionText="Delete" onClick={onDelete} />
      </TableCell>
    </TableRow>
  );
};
