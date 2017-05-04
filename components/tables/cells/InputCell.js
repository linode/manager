import React from 'react';
import { PropTypes } from 'prop-types';

import { Input } from 'linode-components/forms';
import TableCell from './TableCell';


export default function InputCell(props) {
  const { column, onChange, placeholder, record, value } = props;

  return (
    <TableCell column={column} record={record}>
      <Input
        onChange={(e) => { onChange(record, e.target.value); }}
        placeholder={placeholder}
        value={value}
      />
    </TableCell>
  );
}

InputCell.propTypes = {
  column: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  record: PropTypes.object.isRequired,
  value: PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number,
  ]),
};
