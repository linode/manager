import React from 'react';
import { PropTypes } from 'prop-types';

import { Dropdown } from 'linode-components/dropdowns';

import TableCell from './TableCell';


export default function DropdownCell(props) {
  const { column, record } = props;

  return (
    <TableCell className="DropdownCell" column={column} record={record}>
      <Dropdown groups={column.groups(record)} />
    </TableCell>
  );
}

DropdownCell.propTypes = {
  column: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
};
