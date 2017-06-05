import React from 'react';
import { PropTypes } from 'prop-types';


export default function ParamFieldCell(props) {
  const { record } = props;

  let subLabel;
  if (record.required) {
    subLabel = (
      <div className="Label Label-required">
        required
      </div>
    );
  } else {
    subLabel = (
      <div className="Label Label-optional">
        optional
      </div>
    );
  }

  return (
    <td className={`TableCell FieldCell`}>
      <div className="FieldCell-inner">
        <div>
          {record.name}
        </div>
        {subLabel}
      </div>
    </td>
  );
}

ParamFieldCell.propTypes = {
  record: PropTypes.shape({
    name: PropTypes.string,
  }),
};
