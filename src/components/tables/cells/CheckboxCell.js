import React, { Component, PropTypes } from 'react';

import { Checkbox } from '~/components/form';
import TableCell from './TableCell';


export default class CheckboxCell extends Component {

  render() {
    const { checked, column, record, onChange } = this.props;

    return (
      <TableCell className="CheckboxCell" column={column} record={record}>
        <Checkbox
          checked={checked}
          className="Table-rowSelector"
          onChange={(e) => onChange(e.target.checked)}
        />
      </TableCell>
    );
  }
};

CheckboxCell.propTypes = {
  checked: PropTypes.bool,
  column: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  record: PropTypes.object.isRequired,
};

CheckboxCell.defaultProps = {
  checked: false,
};
