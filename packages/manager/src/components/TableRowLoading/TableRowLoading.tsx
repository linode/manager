import * as React from 'react';
import Hidden, { HiddenProps } from '../core/Hidden';
import Skeleton from '../core/Skeleton';
import { makeStyles } from '@mui/styles';
import { TableCell } from '../TableCell/TableCell';
import { TableRow } from '../TableRow/TableRow';

const useStyles = makeStyles(() => ({
  root: {
    '& :last-child': {
      paddingRight: 15,
    },
  },
}));

export interface TableRowLoadingProps {
  columns?: number;
  responsive?: Record<number, HiddenProps>;
  rows?: number;
}

export const TableRowLoading = ({
  columns = 1,
  responsive,
  rows = 1,
}: TableRowLoadingProps) => {
  const classes = useStyles();
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
        className={classes.root}
        data-testid="table-row-loading"
        key={`table-loading-row-${i}`}
      >
        {cols}
      </TableRow>
    );
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{tableRows}</>;
};
