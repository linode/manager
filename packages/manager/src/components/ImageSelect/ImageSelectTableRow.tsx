import { FormControlLabel, Radio } from '@linode/ui';
import { convertStorageUnit, pluralize } from '@linode/utilities';
import React from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { formatDate } from 'src/utilities/formatDate';

import type { Image } from '@linode/api-v4';

interface Props {
  image: Image;
  onSelect: () => void;
  selected: boolean;
  timezone?: string;
}

export const ImageSelectTableRow = (props: Props) => {
  const { image, onSelect, selected, timezone } = props;

  const { created, id, image_sharing, label, regions, size, status } = image;

  const getSizeDisplay = () => {
    if (status === 'available') {
      const sizeInGB = convertStorageUnit('MB', size, 'GB');
      const formatted = Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }).format(sizeInGB);
      return `${formatted} GB`;
    }
    return 'Pending';
  };

  const getShareGroupDisplay = () => {
    if (image_sharing?.shared_by?.sharegroup_label) {
      return image_sharing.shared_by.sharegroup_label;
    }
    if (
      image_sharing?.shared_with?.sharegroup_count !== null &&
      image_sharing?.shared_with?.sharegroup_count !== undefined
    ) {
      return pluralize(
        'Share Group',
        'Share Groups',
        image_sharing.shared_with.sharegroup_count
      );
    }
    return '—';
  };

  return (
    <TableRow key={id}>
      <TableCell noWrap>
        <FormControlLabel
          checked={selected}
          control={<Radio />}
          label={label}
          onChange={onSelect}
          sx={{ gap: 2 }}
        />
      </TableCell>
      <TableCell noWrap>
        {regions?.length > 0
          ? pluralize('Region', 'Regions', regions.length)
          : '—'}
      </TableCell>
      <TableCell noWrap>{getShareGroupDisplay()}</TableCell>
      <TableCell noWrap>{getSizeDisplay()}</TableCell>
      <TableCell noWrap>{formatDate(created, { timezone })}</TableCell>
      <TableCell noWrap>{id}</TableCell>
    </TableRow>
  );
};
