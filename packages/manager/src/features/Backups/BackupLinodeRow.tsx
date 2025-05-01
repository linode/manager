import { useRegionsQuery } from '@linode/queries';
import { Typography } from '@linode/ui';
import * as React from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useTypeQuery } from 'src/queries/types';
import { getMonthlyBackupsPrice } from 'src/utilities/pricing/backups';
import {
  PRICE_ERROR_TOOLTIP_TEXT,
  UNKNOWN_PRICE,
} from 'src/utilities/pricing/constants';

import type { Linode, PriceObject } from '@linode/api-v4';

interface Props {
  error?: string;
  linode: Linode;
}

export const BackupLinodeRow = (props: Props) => {
  const { error, linode } = props;
  const { data: type } = useTypeQuery(linode.type ?? '', Boolean(linode.type));
  const { data: regions } = useRegionsQuery();

  const backupsMonthlyPrice: PriceObject['monthly'] | undefined =
    getMonthlyBackupsPrice({
      region: linode.region,
      type,
    });

  const regionLabel =
    regions?.find((r) => r.id === linode.region)?.label ?? linode.region;

  const hasInvalidPrice =
    backupsMonthlyPrice === null || backupsMonthlyPrice === undefined;

  return (
    <TableRow key={`backup-linode-${linode.id}`}>
      <TableCell>
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
      <TableCell>{type?.label ?? linode.type ?? 'Unknown'}</TableCell>
      <TableCell>{regionLabel ?? 'Unknown'}</TableCell>
      <TableCell
        errorCell={hasInvalidPrice}
        errorText={hasInvalidPrice ? PRICE_ERROR_TOOLTIP_TEXT : undefined}
      >
        {`$${backupsMonthlyPrice?.toFixed(2) ?? UNKNOWN_PRICE}/mo`}
      </TableCell>
    </TableRow>
  );
};
