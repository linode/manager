import React, { PropTypes } from 'react';

import { Dropdown } from 'linode-components/dropdowns';
import { TableCell } from 'linode-components/tables/cells';


export default function NameserversCell(props) {
  const { column, record } = props;
  const { onEditClick, onDeleteClick } = column;

  let actions;
  // Linode nameservers are readonly
  if (record.readOnly) {
    actions = (
      <small className="text-muted">Read-only</small>
    );
  } else {
    const groups = [
      { elements: [{ name: 'Edit', action: () => onEditClick(record) }] },
      { elements: [{ name: 'Delete', action: () => onDeleteClick(record) }] },
    ];
    actions = <Dropdown groups={groups} analytics={{ title: 'DNS record actions' }} />;
  }

  return (
    <TableCell column={column} record={record} className="ActionsCell">
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
