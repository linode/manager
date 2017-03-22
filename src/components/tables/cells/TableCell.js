import React, { PropTypes } from 'react';


export default function TableCell(props) {
  const { column, record } = props;
  const { formatFn } = column;
  const className = column.className || props.className || '';

  // TODO: add dynamic class name based on column type ( numeric/text/etc )
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
  children: PropTypes.node,
  className: PropTypes.string,
  column: PropTypes.shape({
    className: PropTypes.string,
    dataKey: PropTypes.string,
  }).isRequired,
  formatFn: PropTypes.func,
  record: PropTypes.shape({
    id: PropTypes.number,
  }).isRequired,
};

