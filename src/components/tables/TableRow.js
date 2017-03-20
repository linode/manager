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
    const { columns, record, selectedMap } = nextProps;
    const checkboxColumn = columns.filter(function (column) {
      return column.cellComponent && (column.cellComponent === CheckboxCell);
    })[0];

    if (checkboxColumn) {
      const { selectedKey = 'id', selectedKeyFn } = checkboxColumn;

      if (selectedKeyFn) {
        this.setState({ selected: selectedMap[selectedKeyFn(record)] });
      } else {
        this.setState({ selected: selectedMap[record[selectedKey]] });
      }
    }
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
    let { selected } = this.state;

    const selectedClass = selected ? 'TableRow--selected' : '';
    return (
      <tr className={`TableRow ${selectedClass}`}>
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
  selectedMap: PropTypes.object,
};
