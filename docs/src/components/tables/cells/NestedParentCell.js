import React from 'react';
import { PropTypes } from 'prop-types';


export default function NestedParentCell(props) {
  const { record } = props;

  return (
    <td className="TableCell FieldCell">
      <i className={`fa fa-caret-${record.selected ? 'down' : 'right'}`} />
      {record.name}
    </td>
  );
}

NestedParentCell.propTypes = {
  record: PropTypes.shape({
    name: PropTypes.string,
    selected: PropTypes.bool,
  }),
};
