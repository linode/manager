import React, { PropTypes } from 'react';

import { TableCell } from 'linode-components/tables/cells';
import TimeDisplay from '~/components/TimeDisplay';


export default function LastBackupCell(props) {
  const { column, record } = props;

  return (
    <TableCell column={column} record={record}>
      {record.backups.last_backup ?
        <TimeDisplay time={record.backups.last_backup} />
        : 'Unknown'}
    </TableCell>
  );
}

LastBackupCell.propTypes = {
  column: PropTypes.object.isRequired,
  record: PropTypes.shape({
    backups: PropTypes.object,
  }).isRequired,
};
