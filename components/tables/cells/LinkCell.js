import React from 'react';
import { Link } from 'react-router';
import { PropTypes } from 'prop-types';

import { Tooltip } from '../../tooltips';
import TableCell from './TableCell';


export default function LinkCell(props) {
  const { cellIndex, column, record } = props;
  const {
    className = '',
    hrefFn,
    textKey = 'label',
    textFn,
    disableTooltip = false,
  } = column;

  let children = props.children;
  if (!children) {
    if (textFn) {
      children = textFn(record);
    } else {
      children = record[textKey];
    }
  }

  const name = record[textKey];
  let tooltipComponent;
  let tooltipAttributes;
  if (!disableTooltip) {
    const tooltipId = `tooltip-${record.id}-${cellIndex}`;
    const idText = `ID: ${record.id}`;
    const tooltipText = (
      <div>
        <div>
          {name}
        </div>
        {idText}
      </div>
    );

    tooltipAttributes = {'data-tip': true, 'data-for': tooltipId };
    tooltipComponent = (
      <Tooltip id={tooltipId}>{tooltipText}</Tooltip>
    );
  }

  return (
    <TableCell
      cellIndex={cellIndex}
      className={`LinkCell ${className}`}
      column={column}
      record={record}
    >
      <Link to={hrefFn(record)} {...tooltipAttributes}>
        {children}
      </Link>
      {tooltipComponent}
    </TableCell>
  );
}

LinkCell.propTypes = {
  cellIndex: PropTypes.number,
  children: PropTypes.node,
  className: PropTypes.string,
  column: PropTypes.shape({
    disableTooltip: PropTypes.bool,
    hrefFn: PropTypes.func.isRequired,
    textKey: PropTypes.string,
    // TODO: consider generalizing textFn for formatting
    textFn: PropTypes.func,
  }).isRequired,
  record: PropTypes.object.isRequired,
};
