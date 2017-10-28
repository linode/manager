import React from 'react';
import PropTypes from 'prop-types';

import TableHeaderCell from './TableHeaderCell';


export default function TableHeaderRow(props) {
  const { columns, disableHeader } = props;

  return (
    <tr>
      {columns.map(function (column, index) {
        return (
          <TableHeaderCell
            className={column.headerClassName}
            key={index}
            text={disableHeader ? undefined : column.label}
          />
        );
      })}
    </tr>
  );
}

TableHeaderRow.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
  })).isRequired,
  disableHeader: PropTypes.bool,
};
