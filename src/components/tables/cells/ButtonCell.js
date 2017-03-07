import React, { PropTypes } from 'react';

import { Button } from '~/components/buttons';
import TableCell from './TableCell';


export default function ButtonCell(props) {
  const { column, record } = props;
  const { text, onClick } = column;

  return (
    <TableCell column={column} record={record}>
      <Button onClick={() => { onClick(record); }}>{text}</Button>
    </TableCell>
  )
};

ButtonCell.propTypes = {
  column: PropTypes.shape({
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func,
  }),
  record: PropTypes.object,
};
