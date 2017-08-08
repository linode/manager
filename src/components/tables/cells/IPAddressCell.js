import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import { TableCell } from 'linode-components/tables/cells';


export default function IPAddressCell(props) {
  const { column, record } = props;

  let ipv4 = record.ipv4;
  if (Array.isArray(ipv4)) {
    const allPublic = ipv4.filter(ip => !ip.startsWith('192.168'));
    ipv4 = (
      <span>
        {allPublic[0]} {allPublic.length <= 1 ? null : (
          <small className="text-muted">
            <Link to={`/linodes/${record.label}/networking`}>(+{allPublic.length - 1})</Link>
          </small>
        )}
      </span>
    );
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
