import React from 'react';
import { PropTypes } from 'prop-types';


// { label: 'Type', dataKey: 'type', headerClassName: 'TypeColumn' },
export default function FieldCell(props) {
  const { column, record } = props;

  return (
    <td className={`Table-cell FieldCell`}>
      <div>
        {record.name}
      </div>
      {/*<div className="FieldCell-type">*/}
        {/*<small><i>{record.type}</i></small>*/}
      {/*</div>*/}
    </td>
  );
}
