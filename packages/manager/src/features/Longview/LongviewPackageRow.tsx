import { Box } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import type { LongviewPackage } from './request.types';
import type { TableRowOwnProps } from '@mui/material';

interface Props {
  hover?: TableRowOwnProps['hover'];
  lvPackage: LongviewPackage;
}

export const LongviewPackageRow = (props: Props) => {
  const { hover, lvPackage } = props;
  const theme = useTheme();

  return (
    <TableRow hover={hover}>
      <TableCell>{lvPackage.name}</TableCell>
      <TableCell>
        <div>{lvPackage.current}</div>
        <Box color={theme.color.green}>{lvPackage.new}</Box>
      </TableCell>
    </TableRow>
  );
};
