import React from 'react';
import { PropTypes } from 'prop-types';


export default function ParamFieldCell(props) {
  const { record } = props;

  let subLabel;
  if (record.required) {
    subLabel = (
      <div className="FieldCell-label">
        <small className="text-muted">required</small>
      </div>
    );
  } else {
    subLabel = (
      <div className="FieldCell-label">
        <small className="text-muted">optional</small>
      </div>
    );
  }

  return (
    <td className="TableCell FieldCell">
      <div>
        {record.name}
      </div>
      {subLabel}
    </td>
  );
}

ParamFieldCell.propTypes = {
  record: PropTypes.shape({
    name: PropTypes.string,
  }),
};
