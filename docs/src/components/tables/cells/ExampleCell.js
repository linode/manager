import React from 'react';
import { PropTypes } from 'prop-types';

import { Code } from 'linode-components/formats';


export default function ExampleCell(props) {
  const { example, colSpan } = props;

  return (
    <td className="Table-cell ExampleCell" colSpan={colSpan}>
      <Code example={JSON.stringify(example, null, 2)} name="json" />
    </td>
  );
}

ExampleCell.propTypes = {
  colSpan: PropTypes.number,
  example: PropTypes.string,
};
