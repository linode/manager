import React, { PropTypes } from 'react';

import { Button } from '~/components/buttons';
import TableCell from './TableCell';


export default function ButtonCell(props) {
  const { column, record } = props;
  const { text, onClick, buttonClassName='' } = column;

  return (
    <TableCell column={column} record={record}>
      <Button className={buttonClassName} onClick={() => { onClick(record); }}>{text}</Button>
    </TableCell>
  );
}

ButtonCell.propTypes = {
  column: PropTypes.shape({
    buttonClassName: PropTypes.string,
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func,
  }),
  record: PropTypes.object,
};
