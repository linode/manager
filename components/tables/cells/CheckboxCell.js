import React from 'react';
import { PropTypes } from 'prop-types';

import { Checkbox } from 'linode-components/forms';
import TableCell from './TableCell';


export default function CheckboxCell(props) {
  const { checked, column, onChange, record } = props;

  return (
    <TableCell className="CheckboxCell" column={column} record={record}>
      <Checkbox
        checked={checked}
        className="TableRow-selector"
        onChange={(e) => {
          onChange(record, e.target.checked);
        }}
      />
    </TableCell>
  );
}

CheckboxCell.propTypes = {
  checked: PropTypes.bool,
  column: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  record: PropTypes.object.isRequired,
};

CheckboxCell.defaultProps = {
  checked: false,
};
