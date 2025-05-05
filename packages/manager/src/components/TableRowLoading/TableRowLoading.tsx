import * as React from 'react';

import { Hidden } from '../Hidden';
import { Skeleton } from '../Skeleton';
import { TableCell } from '../TableCell/TableCell';
import { TableRow } from '../TableRow/TableRow';

import type { HiddenProps } from '../Hidden';
import type { SxProps } from '@mui/material/styles';

export interface TableRowLoadingProps {
  /**
   * The number of columns the empty state should span
   * @default 1
   */
  columns?: number;
  /**
   * Optional responsive props to hide cells at certain breakpoints
   */
  responsive?: Record<number, HiddenProps>;
  /**
   * The number of rows to display to customize the loading table's height)
   * @default 1
   */
  rows?: number;
  /**
   * The style overrides for the TableRow
   */
  sx?: SxProps;
}

export const TableRowLoading = ({
  columns = 1,
  responsive,
  rows = 1,
  sx,
}: TableRowLoadingProps) => {
  const cols = [];

  for (let j = 0; j < columns; j++) {
    const Cell = (
      <TableCell key={`table-loading-cell-${j}`}>
        <Skeleton />
      </TableCell>
    );

    if (responsive && responsive[j]) {
      cols.push(
        <Hidden key={`table-loading-hidden-${j}`} {...responsive[j]}>
          {Cell}
        </Hidden>
      );
    } else {
      cols.push(Cell);
    }
  }

  const tableRows = [];

  for (let i = 0; i < rows; i++) {
    tableRows.push(
      <TableRow
        aria-label="Table content is loading"
        data-testid="table-row-loading"
        key={`table-loading-row-${i}`}
        sx={{
          ...sx,
          '&& :last-child': {
            paddingRight: '15px',
          },
        }}
      >
        {cols}
      </TableRow>
    );
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{tableRows}</>;
};
