import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import TableCell from './TableCell';


export default function LinkCell(props) {
  const { column, record } = props;
  const {
    className = '',
    hrefFn,
    titleKey = 'id',
    textKey = 'label',
    textFn,
  } = column;

  let children = props.children;
  if (!children) {
    if (textFn) {
      children = textFn(record);
    } else {
      children = record[textKey];
    }
  }

  return (
    <TableCell className={`LinkCell ${className}`} column={column} record={record}>
      <Link
        to={hrefFn(record)}
        title={record[titleKey]}
      >
        {children}
      </Link>
    </TableCell>
  );
}

LinkCell.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  column: PropTypes.shape({
    hrefFn: PropTypes.func.isRequired,
    titleKey: PropTypes.string,
    textKey: PropTypes.string,
    // TODO: consider generalizing textFn for formatting
    textFn: PropTypes.func,
  }).isRequired,
  record: PropTypes.object.isRequired,
};
