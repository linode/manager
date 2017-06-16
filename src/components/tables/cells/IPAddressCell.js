import React, { PropTypes } from 'react';

import { TableCell } from 'linode-components/tables/cells';


// TODO: this could potentially be a more generic stacked values cell
export default function IPAddressCell(props) {
  const { column, record } = props;

  let ipv4 = record.ipv4;
  if (Array.isArray(ipv4)) {
    ipv4 = ipv4.filter(ip => !ip.startsWith('192.168'))[0];
  }

  let ipv6 = null;
  if (record.ipv6 && record.ipv6 !== 'None/64') {
    ipv6 = <div className="text-muted">{record.ipv6}</div>;
  }

  return (
    <TableCell column={column} record={record}>
      {ipv4}
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
