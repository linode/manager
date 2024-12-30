import { Box } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import type { LongviewPackage } from './request.types';

interface Props {
  lvPackage: LongviewPackage;
}

export const LongviewPackageRow = (props: Props) => {
  const { lvPackage } = props;
  const theme = useTheme();

  return (
    <TableRow>
      <TableCell>{lvPackage.name}</TableCell>
      <TableCell>
        <div>{lvPackage.current}</div>
        <Box color={theme.color.green}>{lvPackage.new}</Box>
      </TableCell>
    </TableRow>
  );
};
