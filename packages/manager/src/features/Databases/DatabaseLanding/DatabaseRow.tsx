// import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
// import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
// import ActionMenu, { ActionHandlers } from './DatabaseActionMenu';

export const DatabaseRow: React.FC = () => {
  // const classes = useStyles();

  return (
    <TableRow
    // key={`database-row-${id}`}
    // data-testid={`database-row-${id}`}
    // ariaLabel={`Database ${description}`}
    >
      <TableCell>Label</TableCell>
      <TableCell>Status</TableCell>
      <TableCell>Region</TableCell>
      <TableCell>Hostname</TableCell>
      <TableCell>Port</TableCell>
      <TableCell>Last Backup</TableCell>
      <TableCell>Tags</TableCell>

      <TableCell>
        {/* <ActionMenu
          databaseID={id}
          databaseLabel={description}
          {...actionHandlers}
        /> */}
      </TableCell>
    </TableRow>
  );
};

export default compose(React.memo)(DatabaseRow);
