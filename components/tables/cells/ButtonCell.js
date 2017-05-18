import React from 'react';
import { PropTypes } from 'prop-types';

import { Button } from 'linode-components/buttons';
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
        className={buttonClassName || 'btn-secondary'}
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
