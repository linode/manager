import { Linode } from '@linode/api-v4';
import * as React from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';
import { useRegionsQuery } from 'src/queries/regions';
import { useTypeQuery } from 'src/queries/types';
import { getLinodeRegionBackupPrice } from 'src/utilities/pricing/linodes';

interface Props {
  error?: string;
  linode: Linode;
}

export const BackupLinodeRow = (props: Props) => {
  const { error, linode } = props;
  const { data: type } = useTypeQuery(linode.type ?? '', Boolean(linode.type));
  const { data: regions } = useRegionsQuery();
  const flags = useFlags();

  const backupsPrice = flags.dcSpecificPricing
    ? type
      ? getLinodeRegionBackupPrice(type, linode.region).monthly
      : undefined
    : type?.addons.backups.price.monthly;

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
      {flags.dcSpecificPricing ? (
        <TableCell parentColumn="Region">{regionLabel ?? 'Unknown'}</TableCell>
      ) : undefined}
      <TableCell parentColumn="Price">
        {`$${backupsPrice?.toFixed(2) ?? 'Unknown'}/mo`}
      </TableCell>
    </TableRow>
  );
};
