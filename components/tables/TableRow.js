import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { TableCell, CheckboxCell, RadioCell } from 'linode-components/tables/cells';


export default class TableRow extends Component {
  onCheckboxChange = (record, checked) => {
    const { onToggleSelect } = this.props;

    if (onToggleSelect) {
      onToggleSelect(record, checked);
    }
  };

  onRadioChange = (record, checked) => {
    const { onToggleSelect } = this.props;

    if (onToggleSelect) {
      onToggleSelect(record, checked);
    }
  };

  render() {
    const { className, columns, onClick, record, selectedMap } = this.props;
    const checkboxColumn = columns.filter(function (column) {
      return column.cellComponent &&
        (column.cellComponent === CheckboxCell) &&
        !column.onChange;
    })[0];
    const radioColumn = columns.filter(function (column) {
      return column.cellComponent &&
        (column.cellComponent === RadioCell) &&
        !column.onChange;
    })[0];

    let selected;
    if (checkboxColumn) {
      const { selectedKey = 'id', selectedKeyFn } = checkboxColumn;

      if (selectedKeyFn) {
        selected = selectedMap[selectedKeyFn(record)];
      } else {
        selected = selectedMap[record[selectedKey]];
      }
    } else if (radioColumn) {
      const { selectedKey = 'id', selectedKeyFn } = radioColumn;

      if (selectedKeyFn) {
        selected = selectedMap[selectedKeyFn(record)];
      } else {
        selected = selectedMap[record[selectedKey]];
      }
    }

    const selectedClass = selected ? 'TableRow--selected' : '';
    return (
      <tr className={`TableRow ${className} ${selectedClass}`} onClick={onClick}>
        {columns.map((column, index) => {
          // rendering options from most to least specific

          // dependency injected component class or function
          if (column.cellComponent) {
            if (column.cellComponent === CheckboxCell) {
              return (
                <column.cellComponent
                  key={index}
                  cellIndex={index}
                  checked={record[column.dataKey] || selected}
                  column={column}
                  record={record}
                  onChange={column.onChange || this.onCheckboxChange}
                />
              );
            } else if (column.cellComponent === RadioCell) {
              return (
                <column.cellComponent
                  key={index}
                  cellIndex={index}
                  checked={record[column.dataKey] || selected}
                  column={column}
                  record={record}
                  onChange={column.onChange || this.onRadioChange}
                />
              );
            }

            return (
              <column.cellComponent
                key={index}
                cellIndex={index}
                column={column}
                record={record}
              />
            );
          }

          // default table cell
          return (
            <TableCell
              key={index}
              cellIndex={index}
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
  className: PropTypes.string,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  onToggleSelect: PropTypes.func,
  onClick: PropTypes.func,
  record: PropTypes.object.isRequired,
  selectedMap: PropTypes.object,
};

TableRow.defaultProps = {
  className: '',
};
