import React, { PropTypes } from 'react';

import { TableCell } from '~/components/tables/cells';
import StatusDropdown from './StatusDropdown';


export default function StatusDropdownCell(props) {
  const { column, record } = props;

  return (
    <TableCell column={column} record={record}>
      <StatusDropdown
        linode={record}
        dispatch={props.dispatch}
        className="float-xs-right"
      />
    </TableCell>
  )
};

StatusDropdownCell.propTypes = {

};
