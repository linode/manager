import React, { PropTypes } from 'react';

import TableCell from './TableCell';


// TODO: this could potentially be a more generic stacked values cell
export default function IPAddressCell(props) {
  const { column, record } = props;

  let ipv6 = null;
  if (record.ipv6) {
    ipv6 = (<div className="text-muted">{record.ipv6.split('/')[0]}</div>);
  }

  return (
    <TableCell column={column} record={record}>
      {record.ipv4}
      {ipv6}
    </TableCell>
  );
}

IPAddressCell.propTypes = {
  column: PropTypes.object.isRequired,
  record: PropTypes.shape({
    ipv4: PropTypes.any,
    ipv6: PropTypes.string,
  }),
};
