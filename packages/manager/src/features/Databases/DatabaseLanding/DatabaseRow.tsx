import React from 'react';
import { Database } from '@linode/api-v4/lib/databases/types';
import { Link } from 'react-router-dom';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';

interface Props {
  database: Database;
}

export const DatabaseRow: React.FC<Props> = ({ database }) => {
  const { id, label, engine, created } = database;
  return (
    <TableRow key={`database-row-${id}`} ariaLabel={`Database ${label}`}>
      <TableCell>
        <Link to={`/databases/${id}`}>{label}</Link>
      </TableCell>
      {/* How do we populate this cell value> */}
      <TableCell>Primary +2</TableCell>
      <TableCell>{engine}</TableCell>
      <TableCell>{created}</TableCell>
    </TableRow>
  );
};

export default React.memo(DatabaseRow);
