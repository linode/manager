import React from 'react';
import { Link } from 'react-router';
import PropTypes from 'prop-types';

import { Tooltip } from '../../tooltips';
import TableCell from './TableCell';


export default function LinkCell(props) {
  const { cellIndex, column, record } = props;
  const {
    className = '',
    hrefFn,
    idKey = 'id',
    textKey = 'label',
    textFn,
    subtitleFn,
    tooltipEnabled = false,
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
  let tooltipEnabledClass = '';
  if (tooltipEnabled) {
    const tooltipId = `tooltip-${record[idKey]}-${cellIndex}`;
    const idText = `ID: ${record[idKey]}`;
    const tooltipText = (
      <div>
        <div>
          {name}
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
      className={`LinkCell ${className} ${tooltipEnabledClass}`}
      column={column}
      record={record}
    >
      <Link to={hrefFn(record)} {...tooltipAttributes}>
        {children}
      </Link>
      {tooltipComponent}
      {subtitleFn ? <div><small>{subtitleFn(record)}</small></div> : null}
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
    subtitleFn: PropTypes.func,
  }).isRequired,
  record: PropTypes.object.isRequired,
};
