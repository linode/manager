import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { displayPrice as _displayPrice } from 'src/components/DisplayPrice/DisplayPrice';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { ExtendedType } from 'src/utilities/extendType';

import { ExtendedLinode } from './types';

interface BackupLinodesProps {
  linodes: ExtendedLinode[];
}

export const displayPrice = (price: number | string) => {
  if (typeof price === 'string') {
    return price;
  }
  return _displayPrice(price);
};

const getLabel = (type?: ExtendedType) => type?.formattedLabel ?? 'Unknown';

const getPrice = (type?: ExtendedType) =>
  type?.addons?.backups?.price?.monthly ?? 'Unavailable';

export const BackupLinodes = (props: BackupLinodesProps) => {
  const theme = useTheme();
  const { linodes } = props;
  return (
    <React.Fragment>
      {linodes &&
        linodes.map((linode: ExtendedLinode, idx: number) => {
          const error = linode.linodeError?.reason ?? '';
          return (
            <React.Fragment key={`backup-linode-${idx}`}>
              <TableRow data-qa-linodes data-testid="backup-linode-table-row">
                <TableCell data-qa-linode-label parentColumn="Label">
                  <Typography variant="body1">{linode.label}</Typography>
                  {error && (
                    <Typography
                      sx={{
                        color: theme.color.red,
                        fontSize: 13,
                      }}
                      variant="body1"
                    >
                      {error}
                    </Typography>
                  )}
                </TableCell>

                <TableCell data-qa-linode-plan parentColumn="Plan">
                  {getLabel(linode.typeInfo)}
                </TableCell>
                <TableCell
                  data-qa-backup-price
                  parentColumn="Price"
                >{`${displayPrice(getPrice(linode.typeInfo))}/mo`}</TableCell>
              </TableRow>
            </React.Fragment>
          );
        })}
    </React.Fragment>
  );
};

BackupLinodes.displayName = 'BackupLinodes';
