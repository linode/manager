import React, { PropTypes } from 'react';

import { Button } from '~/components/buttons';
import TableCell from './TableCell';


export default function ButtonCell(props) {
  const { column, record } = props;
  const {
    buttonClassName,
    isDisabledFn,
    text,
    onClick,
    hrefFn,
  } = column;
  let to;
  if (hrefFn) {
    to = hrefFn(record);
  }

  let disabled = false;
  if (isDisabledFn) {
    disabled = isDisabledFn(record);
  }

  return (
    <TableCell className="ButtonCell" column={column} record={record}>
      <Button
        className={buttonClassName}
        disabled={disabled}
        onClick={() => {
          if (onClick) {
            onClick(record);
          }
        }}
        to={to}
      >{text}</Button>
    </TableCell>
  );
}

ButtonCell.propTypes = {
  column: PropTypes.shape({
    buttonClassName: PropTypes.string,
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func,
  }),
  isDisabledFn: PropTypes.func,
  record: PropTypes.object,
};

ButtonCell.defaultProps = {
  buttonClassName: '',
};
