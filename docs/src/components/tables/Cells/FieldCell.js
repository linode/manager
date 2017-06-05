import React from 'react';
import { PropTypes } from 'prop-types';


export default function FieldCell(props) {
  const { record } = props;

  return (
    <td className={`TableCell FieldCell`}>
      <div className="FieldCell-inner">
        {record.name}
      </div>
    </td>
  );
}

FieldCell.propTypes = {
  record: PropTypes.shape({
    name: PropTypes.string,
  }),
};
