import React, { PropTypes } from 'react';

import TableCell from './TableCell';


export default function IPRdnsCell(props) {
  const { column, record } = props;
  const { ipKey } = column;

  const ip = ipKey ? record[ipKey] : record;
  let str = `${ip.address}`;
  if (ip.rdns) {
    str += ` (${ip.rdns})`;
  }

  return (
    <TableCell column={column} record={record}>
      {str}
    </TableCell>
  );
}

IPRdnsCell.propTypes = {
  column: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
};
