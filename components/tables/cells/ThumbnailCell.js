import React from 'react';
import { PropTypes } from 'prop-types';

import TableCell from './TableCell';


export default function ThumbnailCell(props) {
  const { column, record } = props;

  let src = column.srcFn(record);
  if (!src) {
    src = '/assets/default/cube.png';
  }

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
