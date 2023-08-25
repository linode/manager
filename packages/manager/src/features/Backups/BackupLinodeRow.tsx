import { Linode } from '@linode/api-v4';
import * as React from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { useTypeQuery } from 'src/queries/types';

interface Props {
  error?: string;
  linode: Linode;
}

export const BackupLinodeRow = (props: Props) => {
  const { error, linode } = props;
  const { data: type } = useTypeQuery(linode.type ?? '', Boolean(linode.type));
  return (
    <TableRow key={`backup-linode-${linode.id}`}>
      <TableCell parentColumn="Label">
        <Typography variant="body1">{linode.label}</Typography>
        {error && (
          <Typography
            sx={(theme) => ({
              color: theme.color.red,
              fontSize: 13,
            })}
            variant="body1"
          >
            {error}
          </Typography>
        )}
      </TableCell>
      <TableCell parentColumn="Plan">
        {type?.label ?? linode.type ?? 'Unknown'}
      </TableCell>
      <TableCell parentColumn="Price">
        {`$${type?.addons.backups.price.monthly?.toFixed(2) ?? 'Unknown'}/mo`}
      </TableCell>
    </TableRow>
  );
};
