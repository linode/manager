import React, { PropTypes } from 'react';

import { Button } from '~/components/buttons';
import TableCell from './TableCell';

import { NAME_SERVERS } from '~/constants';


export default function NameserversCell(props) {
  const { column, record } = props;
  const { onEditClick, onDeleteClick } = column;

  let actions;
  // Linode nameservers are readonly
  if (NAME_SERVERS.indexOf(record.name) > -1) {
    actions = (
      <small className="text-muted">Read-only</small>
    );
  } else {
    actions = (
      <div>
        <Button onClick={() => { onEditClick(record); }}>Edit</Button>
        <Button onClick={() => { onDeleteClick(record); }}>Delete</Button>
      </div>
    );
  }

  return (
    <TableCell column={column} record={record}>
      {actions}
    </TableCell>
  );
}

NameserversCell.propTypes = {
  column: PropTypes.shape({
    text: PropTypes.string,
    onClick: PropTypes.func,
  }).isRequired,
  record: PropTypes.object.isRequired,
};
