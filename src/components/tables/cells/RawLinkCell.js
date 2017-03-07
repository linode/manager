import React, { PropTypes } from 'react';

import TableCell from './TableCell';


export default function RawLinkCell(props) {
  const { column, record } = props;
  const {
    hrefFn,
    onClick,
    titleKey = 'id',
    textKey = 'label',
  } = column;

  return (
    <TableCell column={column} record={record}>
      <a
        href={hrefFn ? hrefFn(record) : null}
        className="Table-rowLabel"
        onClick={onClick}
        title={record[titleKey]}
      >
        {props.children || record[textKey]}
      </a>
    </TableCell>
  )
};

RawLinkCell.propTypes = {
  column: PropTypes.shape({
    hrefFn: PropTypes.func.isRequired,
    onClick: PropTypes.func,
    titleKey: PropTypes.string,
    textKey: PropTypes.string,
  }).isRequired,
  record: PropTypes.object.isRequired,
};
