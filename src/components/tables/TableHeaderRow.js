import React, { PropTypes } from 'react';

import TableHeaderCell from './TableHeaderCell';


export default function TableHeaderRow(props) {
  const { columns } = props;

  return (
    <tr>
      {columns.map(function (column, index) {
        return (<TableHeaderCell key={index} text={column.label} />);
      })}
    </tr>
  );
}

TableHeaderRow.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
  })).isRequired,
};
