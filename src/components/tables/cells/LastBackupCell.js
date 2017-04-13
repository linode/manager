import React, { PropTypes } from 'react';
import moment from 'moment';

import TableCell from './TableCell';


export default function LastBackupCell(props) {
  const { column, record } = props;

  return (
    <TableCell column={column} record={record}>
      {record.backups.last_backup ?
        moment(record.backups.last_backup).format('dddd, MMMM D YYYY LT')
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
