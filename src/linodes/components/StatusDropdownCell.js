import React, { PropTypes } from 'react';

import { TableCell } from '~/components/tables/cells';
import StatusDropdown from './StatusDropdown';


// TODO: Pull dispatch out of status dropdown, handle in container view
export default function StatusDropdownCell(props) {
  const { column, record } = props;
  const { dispatch } = column;

  return (
    <TableCell column={column} record={record}>
      <StatusDropdown
        linode={record}
        dispatch={dispatch}
        className="float-xs-right"
      />
    </TableCell>
  );
}

StatusDropdownCell.propTypes = {
  column: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
  dispatch: PropTypes.func,
};
