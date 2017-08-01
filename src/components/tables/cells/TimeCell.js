import React, { PropTypes } from 'react';

import { TableCell } from 'linode-components/tables/cells';

import TimeDisplay from '~/components/TimeDisplay';


export default function TimeCell(props) {
  const { column, record } = props;
  const time = record[column.timeKey];

  return (
    <TableCell column={column} record={record}>
      {time ? <TimeDisplay time={time} capitalize /> : 'Unknown'}
    </TableCell>
  );
}

TimeCell.propTypes = {
  column: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
};
