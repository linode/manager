import React from 'react';
import { PropTypes } from 'prop-types';


export default function FieldCell(props) {
  const { record } = props;

  return (
    <td className={`Table-cell FieldCell`}>
      {record.name}
    </td>
  );
}

FieldCell.propTypes = {
  record: PropTypes.shape({
    name: PropTypes.string,
  }),
};
