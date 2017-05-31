import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

import TableCell from './TableCell';


export default function LabelCell(props) {
  const { column, record } = props;
  const {
    className = '',
    titleKey = 'id',
    textFn,
    textKey = 'name',
  } = column;

  let children = props.children;
  if (!children) {
    if (textFn) {
      children = textFn(record);
    } else {
      children = record[textKey];
    }
  }

  const title = record[titleKey];
  const tooltipText = (
    <div>
      <div>
        {title}
      </div>
      <div>ID: {record.id}</div>
    </div>
  );

  return (
    <TableCell
      className={`LabelCell ${className}`}
      column={column}
      record={record}
      tooltip={tooltipText}
    >
      {children}
    </TableCell>
  );
}

LabelCell.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  column: PropTypes.shape({
    titleKey: PropTypes.string,
  }),
  record: PropTypes.object.isRequired,
};
