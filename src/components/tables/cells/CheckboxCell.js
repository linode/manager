import React, { PropTypes } from 'react';

import { Checkbox } from '~/components/form';
import TableCell from './TableCell';


export default function CheckboxCell(props) {
  const { checked, column, record } = props;
  const { onChange } = column;

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
