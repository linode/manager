import React, { Component, PropTypes } from 'react';

import TableCell from './cells/TableCell';
import CheckboxCell from './cells/CheckboxCell';


export default class TableRow extends Component {

  constructor(props) {
    super(props);

    this.onCheckboxChange = this.onCheckboxChange.bind(this);
    this.state = { selected: false };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ selected: nextProps.selected });
  }

  onCheckboxChange(checked) {
    const { onToggleSelect } = this.props;

    this.setState({ selected: checked }, () => {
      if (onToggleSelect) {
        onToggleSelect(this.state.selected);
      }
    });
  }

  render() {
    const { columns, record } = this.props;
    const { selected } = this.state;

    // TODO: className based on selected
    // const selectedClass = isSelected ? 'Table-row--selected' : '';
    return (
      <tr className="Table-row">
        {columns.map((column, index) => {
          // rendering options from most to least specific

          // dependency injected component class or function
          if (column.cellComponent) {
            if (column.cellComponent === CheckboxCell) {
              return (
                <column.cellComponent
                  key={index}
                  checked={selected}
                  column={column}
                  record={record}
                  onChange={this.onCheckboxChange}
                />
              );
            }

            return (
              <column.cellComponent
                key={index}
                column={column}
                record={record}
              />
            );
          }

          // default table cell
          return (
            <TableCell
              key={index}
              column={column}
              record={record}
            />
          );
        })}
      </tr>
    );
  }
}

TableRow.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  onToggleSelect: PropTypes.func,
  record: PropTypes.object.isRequired,
  selected: PropTypes.bool,
};
