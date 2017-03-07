import React, { PropTypes } from 'react';


export default function TableCell(props) {
  const { column, formatFn, record } = props;
  let className = column.className || props.className || '';

  // TODO: dynamic class name based on column type ( numeric/text/etc )
  let children = props.children;
  if (!children) {
    children = record[column.dataKey];
    if (formatFn) {
      children = formatFn(children);
    }
  }

  return (
    <td className={`Table-cell ${className}`}>
      {children}
    </td>
  );
}

TableCell.propTypes = {
  column: PropTypes.shape({
    className: PropTypes.string,
    dataKey: PropTypes.string,
  }).isRequired,
  formatFn: PropTypes.func,
  record: PropTypes.shape({
    id: PropTypes.number,
  }).isRequired,
};

