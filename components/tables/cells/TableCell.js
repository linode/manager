import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

import { Tooltip } from '../../tooltips';


export default function TableCell(props) {
  const {
    className = '',
    column,
    record,
    title,
    tooltip,
  } = props;
  const {
    formatFn,
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

  let tooltipComponent;
  let tooltipAttributes;
  if (tooltip) {
    const tooltipId = `tooltip-${record.id}`;

    tooltipAttributes = {'data-tip': true, 'data-for': tooltipId };
    tooltipComponent = (
      <Tooltip id={tooltipId}>{tooltip}</Tooltip>
    );
  }

  return (
    <td
      className={`TableCell ${className} ${columnClassName}`}
    >
      <div className="TableCell-content" {...tooltipAttributes}>
        {children}
      </div>
      {tooltipComponent}
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
  title: PropTypes.string,
};
