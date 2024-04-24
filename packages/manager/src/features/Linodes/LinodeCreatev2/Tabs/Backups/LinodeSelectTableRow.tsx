import React from 'react';

import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { getLinodeIconStatus } from 'src/features/Linodes/LinodesLanding/utils';
import { useImageQuery } from 'src/queries/images';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { useTypeQuery } from 'src/queries/types';
import { capitalize } from 'src/utilities/capitalize';

import type { Linode } from '@linode/api-v4';

interface Props {
  linode: Linode;
}

export const LinodeSelectTableRow = (props: Props) => {
  const { linode } = props;

  const { data: image } = useImageQuery(
    linode.image ?? '',
    Boolean(linode.image)
  );

  const { data: regions } = useRegionsQuery();

  const { data: type } = useTypeQuery(linode.type ?? '', Boolean(linode.type));

  const region = regions?.find((r) => r.id === linode.region);

  return (
    <TableRow key={linode.label}>
      <TableCell>{linode.label}</TableCell>
      <TableCell statusCell>
        <StatusIcon status={getLinodeIconStatus(linode.status)} />
        {capitalize(linode.status)}
      </TableCell>
      <TableCell>{image?.label ?? linode.image}</TableCell>
      <TableCell>{type?.label ?? linode.type}</TableCell>
      <TableCell>{region?.label ?? linode.region}</TableCell>
    </TableRow>
  );
};
