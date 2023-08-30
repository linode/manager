import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import { LongviewPackage } from './request.types';

interface Props {
  lvPackage: LongviewPackage;
}

export const LongviewPackageRow = (props: Props) => {
  const { lvPackage } = props;
  const theme = useTheme();

  return (
    <TableRow ariaLabel={lvPackage.name}>
      <TableCell parentColumn={'Package'}>{lvPackage.name}</TableCell>
      <TableCell parentColumn="Installed Version / Latest Version">
        <div>{lvPackage.current}</div>
        <div style={{ color: theme.color.green }}>{lvPackage.new}</div>
      </TableCell>
    </TableRow>
  );
};
