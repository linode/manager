import PropTypes from 'prop-types';
import React from 'react';

import TableCell from 'linode-components/dist/tables/cells/TableCell';
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
        className="float-sm-right"
      />
    </TableCell>
  );
}

StatusDropdownCell.propTypes = {
  column: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
  dispatch: PropTypes.func,
};
