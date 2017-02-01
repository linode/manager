import React, { PropTypes } from 'react';

export default function SecondaryTable(props) {
  return (
    <table className="SecondaryTable">
      <thead>
        {props.labels.map((l, i) => <th key={i}>{l}</th>)}
      </thead>
      <tbody>
        {props.rows.map((row, i) => (
          <tr key={i} className="SecondaryTable-row">
            {props.keys.map((key, j) =>
              <td key={j} className="SecondaryTable-column">{row[key]}</td>)}
          </tr>))}
      </tbody>
    </table>
  );
}

SecondaryTable.propTypes = {
  labels: PropTypes.array.isRequired,
  keys: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
};
