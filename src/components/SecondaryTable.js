import React, { PropTypes } from 'react';

export function SecondaryTableRow(props) {
  const { keys, data } = props;

  return (
    <tr className="SecondaryTable-row">
      {keys.map((key, i) =>
        <td key={i} className="SecondaryTable-column">{data[key]}</td>)}
    </tr>
  );
}

SecondaryTableRow.propTypes = {
  data: PropTypes.object.isRequired,
  keys: PropTypes.array.isRequired,
};

export default function SecondaryTable(props) {
  const { children, rows, keys, labels } = props;

  return (
    <table className="SecondaryTable">
      <thead>
        <tr>{labels.map((label, i) => <th key={i}>{label}</th>)}</tr>
      </thead>
      <tbody>
        {children || rows.map((data, i) =>
          <SecondaryTableRow
            key={i}
            data={data}
            keys={keys}
          />)}
      </tbody>
    </table>
  );
}

SecondaryTable.propTypes = {
  labels: PropTypes.array.isRequired,
  keys: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
  children: PropTypes.node,
};
