import React from 'react';
import PropTypes from 'prop-types';


export default function TableCell(props) {
  const {
    className = '',
    column,
    record,
  } = props;

  const {
    formatFn,
  } = column;
  const columnClassName = column.className || '';

  // TODO: add dynamic class name based on column type ( numeric/text/etc )
  let children = props.children;
  if (!children) {
    if (column.dataKey) {
      children = record[column.dataKey];
    } else if (column.dataFn) {
      children = column.dataFn(record);
    }

    if (formatFn) {
      children = formatFn(children);
    }
  }

  return (
    <td
      className={`TableCell ${className} ${columnClassName}`}
    >
      <div className="TableCell-content">
        {children}
      </div>
    </td>
  );
}

TableCell.propTypes = {
  cellIndex: PropTypes.number,
  children: PropTypes.node,
  className: PropTypes.string,
  column: PropTypes.shape({
    className: PropTypes.string,
    dataKey: PropTypes.string,
    dataFn: PropTypes.func,
    disableTooltip: PropTypes.bool,
  }).isRequired,
  formatFn: PropTypes.func,
  record: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  title: PropTypes.string,
};
