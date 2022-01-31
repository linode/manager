import React from 'react';
import Hidden, { HiddenProps } from '../core/Hidden';
import Skeleton from '../core/Skeleton';
import { makeStyles } from '../core/styles';
import TableCell from '../TableCell/TableCell';
import TableRow from '../TableRow/TableRow';

const useStyles = makeStyles(() => ({
  root: {
    '& :last-child': {
      paddingRight: 15,
    },
  },
}));

interface Props {
  columns?: number;
  rows?: number;
  responsive?: Record<number, HiddenProps>;
}

const TableLoading: React.FC<Props> = ({
  rows = 1,
  columns = 1,
  responsive,
}) => {
  const classes = useStyles();
  const cols = [];

  for (let j = 0; j < columns; j++) {
    const Cell = (
      <TableCell>
        <Skeleton />
      </TableCell>
    );

    if (responsive && responsive[j]) {
      cols.push(<Hidden {...responsive[j]}>{Cell}</Hidden>);
    } else {
      cols.push(Cell);
    }
  }

  const tableRows = [];

  for (let i = 0; i < rows; i++) {
    tableRows.push(
      <TableRow
        className={classes.root}
        data-testid="table-row-loading"
        aria-label="Table content is loading"
        key={`table-row-loading-${i}`}
      >
        {cols}
      </TableRow>
    );
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{tableRows}</>;
};

export default React.memo(TableLoading);
