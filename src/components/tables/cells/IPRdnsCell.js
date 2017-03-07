import React, { PropTypes } from 'react';

import TableCell from './TableCell';


export default function IPAddressCell(props) {
  const { column, record, ipKey } = props;

  const ip = ipKey ? record[ipKey] : record;
  let str = `${ip.address}`;
  if (ip.rdns) {
    str += `(${ip.rdns})`;
  }

  return (
    <TableCell column={column} record={record}>
      {str}
    </TableCell>
  )
};

IPAddressCell.propTypes = {
  column: PropTypes.object.isRequired,
  ipKey: PropTypes.string,
  record: PropTypes.shape({
    address: PropTypes.string.isRequired,
    rdns: PropTypes.string,
  }).isRequired,
};
