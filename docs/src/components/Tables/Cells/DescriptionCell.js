import React from 'react';
import { PropTypes } from 'prop-types';


export default function DescriptionCell(props) {
  const { column, record } = props;

  return (
    <td className={`Table-cell DescriptionCell`}>
      {record.description}
    </td>
  );
}
