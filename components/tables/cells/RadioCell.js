import React from 'react';
import PropTypes from 'prop-types';

import { Radio } from 'linode-components/forms';
import TableCell from './TableCell';


export default function RadioCell(props) {
  const {
    checked,
    column,
    onChange,
    record,
    name,
    value
  } = props;

  return (
    <TableCell className="RadioCell" column={column} record={record}>
      <Radio
        checked={checked}
        className="TableRow-selector"
        onChange={(e) => {
          onChange(record, e.target.checked, column);
        }}
        name={name}
        value={value}
      />
    </TableCell>
  );
}

RadioCell.propTypes = {
  checked: PropTypes.bool,
  column: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  record: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    null,
  ]),
};

RadioCell.defaultProps = {
  checked: false,
};
