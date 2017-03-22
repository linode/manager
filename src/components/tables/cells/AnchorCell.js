import React, { PropTypes } from 'react';

import TableCell from './TableCell';


export default function AnchorCell(props) {
  const { column, record } = props;
  const {
    onClick,
    titleKey = 'id',
    textKey = 'label',
  } = column;

  return (
    <TableCell column={column} record={record}>
      <button
        className="TableRow-label btn btn-link"
        onClick={() => { onClick(record); }}
        title={record[titleKey]}
      >
        {props.children || record[textKey]}
      </button>
    </TableCell>
  );
}

AnchorCell.propTypes = {
  children: PropTypes.node,
  column: PropTypes.shape({
    onClick: PropTypes.func,
    titleKey: PropTypes.string,
    textKey: PropTypes.string,
  }).isRequired,
  record: PropTypes.object.isRequired,
};
