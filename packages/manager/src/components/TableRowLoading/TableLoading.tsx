import React from 'react';
import Hidden, { HiddenProps } from '../core/Hidden';
import Skeleton from '../core/Skeleton';
import TableCell from '../TableCell/TableCell';
import TableRow from '../TableRow/TableRow';

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
  const cols = [];

  for (let j = 0; j < columns; j++) {
    const skeletonProps = j === columns - 1 ? { style: { width: '85%' } } : {};

    const Cell = (
      <TableCell>
        <Skeleton {...skeletonProps} />
      </TableCell>
    );

    if (responsive && responsive[j]) {
      const props = responsive[j];

      cols.push(<Hidden {...props}>{Cell}</Hidden>);
    } else {
      cols.push(Cell);
    }
  }

  const tableRows = [];

  for (let i = 0; i < rows; i++) {
    tableRows.push(<TableRow key={i}>{cols}</TableRow>);
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{tableRows}</>;
};

export default React.memo(TableLoading);
