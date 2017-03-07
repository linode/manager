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
  } = column;

  return (
    <TableCell className={`LinkCell ${className}`} column={column} record={record}>
      <Link
        to={hrefFn(record)}
        title={record[titleKey]}
      >
        {props.children || record[textKey]}
      </Link>
    </TableCell>
  )
};

LinkCell.propTypes = {
  className: PropTypes.string,
  column: PropTypes.shape({
    hrefFn: PropTypes.func.isRequired,
    titleKey: PropTypes.string,
    textKey: PropTypes.string,
  }).isRequired,
  record: PropTypes.object.isRequired,
};
