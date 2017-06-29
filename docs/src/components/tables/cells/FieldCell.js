import React from 'react';
import { PropTypes } from 'prop-types';


export default function FieldCell(props) {
  const { record } = props;
  const { filterable = false } = record;

  let subLabel;
  if (filterable) {
    subLabel = (
      <div className="FieldCell-label">
        <small className="text-muted">filterable</small>
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

FieldCell.propTypes = {
  record: PropTypes.shape({
    name: PropTypes.string,
    filterable: PropTypes.bool,
  }),
};
