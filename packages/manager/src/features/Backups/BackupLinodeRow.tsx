import { Linode, PriceObject } from '@linode/api-v4';
import * as React from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';
import { useRegionsQuery } from 'src/queries/regions';
import { useTypeQuery } from 'src/queries/types';
import { getMonthlyBackupsPrice } from 'src/utilities/pricing/backups';

interface Props {
  error?: string;
  linode: Linode;
}

export const BackupLinodeRow = (props: Props) => {
  const { error, linode } = props;
  const { data: type } = useTypeQuery(linode.type ?? '', Boolean(linode.type));
  const { data: regions } = useRegionsQuery();
  const flags = useFlags();

  const backupsMonthlyPrice: PriceObject['monthly'] = getMonthlyBackupsPrice({
    flags,
    region: linode.region,
    type,
  });

  const regionLabel =
    regions?.find((r) => r.id === linode.region)?.label ?? linode.region;

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
      {flags.dcSpecificPricing && (
        <TableCell parentColumn="Region">{regionLabel ?? 'Unknown'}</TableCell>
      )}
      <TableCell parentColumn="Price">
        {backupsMonthlyPrice !== 0
          ? `$${backupsMonthlyPrice?.toFixed(2)}/mo`
          : '$Unknown/mo'}
      </TableCell>
    </TableRow>
  );
};
