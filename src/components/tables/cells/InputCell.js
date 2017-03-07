import React, { Component, PropTypes } from 'react';

import { Input } from '~/components/form';
import TableCell from './TableCell';


export default class InputCell extends Component {

  render() {
    const { column, onChange, placeholder, record, value } = this.props;

    return (
      <TableCell column={column} record={record}>
        <Input
          onChange={() => { onChange(record, e.target.value); }}
          placeholder={placeholder}
          value={value}
        />
      </TableCell>
    );
  }
};

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
