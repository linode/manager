import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

import { Tooltip } from '../../tooltips';


export default function TableCell(props) {
  const {
    className = '',
    cellIndex,
    column,
    record,
    title,
  } = props;
  const {
    formatFn,
    disableTooltip = false,
  } = column;
  const columnClassName = column.className || '';

  // TODO: add dynamic class name based on column type ( numeric/text/etc )
  let children = props.children;
  if (!children) {
    children = record[column.dataKey];
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
    disableTooltip: PropTypes.bool,
  }).isRequired,
  formatFn: PropTypes.func,
  record: PropTypes.shape({
    id: PropTypes.number,
  }).isRequired,
  title: PropTypes.string,
};
