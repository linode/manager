import React from 'react';
import PropTypes from 'prop-types';


import { Tooltip } from '../../tooltips';

import TableCell from './TableCell';


export default function LabelCell(props) {
  const { cellIndex, column, record } = props;
  const {
    className = '',
    textFn,
    dataKey = 'name',
    tooltipEnabled = false,
  } = column;

  let children = props.children;
  if (!children) {
    if (textFn) {
      children = textFn(record);
    } else {
      children = record[dataKey];
    }
  }

  const idText = record.id ? (<div>ID: {record.id}</div>) : null;
  let tooltipComponent;
  let tooltipAttributes;
  let tooltipEnabledClass = '';
  if (tooltipEnabled) {
    const tooltipId = `tooltip-${record.id}-${cellIndex}`;
    const tooltipText = (
      <div>
        <div>
          {children}
        </div>
        {idText}
      </div>
    );

    tooltipEnabledClass = 'TooltipEnabled';
    tooltipAttributes = { 'data-tip': true, 'data-for': tooltipId };
    tooltipComponent = (
      <Tooltip id={tooltipId}>{tooltipText}</Tooltip>
    );
  }

  return (
    <TableCell
      cellIndex={cellIndex}
      className={`LabelCell ${className} ${tooltipEnabledClass}`}
      column={column}
      record={record}
    >
      <span {...tooltipAttributes}>{children}</span>
      {tooltipComponent}
    </TableCell>
  );
}

LabelCell.propTypes = {
  cellIndex: PropTypes.number,
  children: PropTypes.node,
  className: PropTypes.string,
  column: PropTypes.shape({
    disableTooltip: PropTypes.bool,
  }),
  record: PropTypes.object.isRequired,
};
