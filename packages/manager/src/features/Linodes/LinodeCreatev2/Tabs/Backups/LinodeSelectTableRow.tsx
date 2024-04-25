import React from 'react';
import { useFormContext } from 'react-hook-form';

import { FormControlLabel } from 'src/components/FormControlLabel';
import { Radio } from 'src/components/Radio/Radio';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { getLinodeIconStatus } from 'src/features/Linodes/LinodesLanding/utils';
import { useImageQuery } from 'src/queries/images';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { useTypeQuery } from 'src/queries/types';
import { capitalize } from 'src/utilities/capitalize';
import { formatStorageUnits } from 'src/utilities/formatStorageUnits';

import { useLinodeCreateQueryParams } from '../../utilities';

import type { CreateLinodeRequest, Linode } from '@linode/api-v4';

interface Props {
  linode: Linode;
}

export const LinodeSelectTableRow = (props: Props) => {
  const { linode } = props;

  const { setValue } = useFormContext<CreateLinodeRequest>();
  const { params, updateParams } = useLinodeCreateQueryParams();

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
          onChange={() => {
            setValue('backup_id', null);
            setValue('region', linode.region);
            if (linode.type) {
              setValue('type', linode.type);
            }
            updateParams({ linodeID: String(linode.id) });
          }}
          checked={linode.id === params.linodeID}
          control={<Radio />}
          label={linode.label}
        />
      </TableCell>
      <TableCell statusCell>
        <StatusIcon status={getLinodeIconStatus(linode.status)} />
        {capitalize(linode.status)}
      </TableCell>
      <TableCell>{image?.label ?? linode.image}</TableCell>
      <TableCell>
        {type?.label ? formatStorageUnits(type.label) : linode.type}
      </TableCell>
      <TableCell>{region?.label ?? linode.region}</TableCell>
    </TableRow>
  );
};
