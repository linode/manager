import PropTypes from 'prop-types';
import React from 'react';

import TableCell from 'linode-components/dist/tables/cells/TableCell';

import TimeDisplay from '~/components/TimeDisplay';


export default function TimeCell(props) {
  const { column, record } = props;
  const time = record[column.timeKey];

  return (
    <TableCell column={column} record={record}>
      {time ? <TimeDisplay time={time} capitalize /> : 'Never'}
    </TableCell>
  );
}

TimeCell.propTypes = {
  column: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
};
