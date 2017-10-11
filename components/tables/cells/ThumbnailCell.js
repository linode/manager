import React from 'react';
import PropTypes from 'prop-types';

import TableCell from './TableCell';


export default function ThumbnailCell(props) {
  const { column, record } = props;

  const src = column.srcFn(record);

  return (
    <TableCell className="ThumbnailCell" column={column} record={record}>
      {!src ? null : <img src={src} role="presentation" />}
    </TableCell>
  );
}

ThumbnailCell.propTypes = {
  column: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
};
