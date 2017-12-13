import PropTypes from 'prop-types';
import React from 'react';

import { TableCell } from 'linode-components';


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
