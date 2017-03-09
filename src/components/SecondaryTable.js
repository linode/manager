import React, { PropTypes } from 'react';

export function SecondaryTableRow(props) {
  const { keys, data } = props;

  return (
    <tr className="SecondaryTable-row" onClick={props.onClick}>
      {keys.map((key, i) =>
        <td key={i} className="SecondaryTable-column">{data[key]}</td>)}
    </tr>
  );
}

SecondaryTableRow.propTypes = {
  data: PropTypes.object.isRequired,
  keys: PropTypes.array.isRequired,
  onClick: PropTypes.func,
};

export default function SecondaryTable(props) {
  const { children, rows, keys, labels } = props;

  return (
    <table className="SecondaryTable">
      <thead>
        <tr>{labels.map((label, i) => <th key={i}>{label}</th>)}</tr>
      </thead>
      <tbody>
        {children || rows.map((data, i) => (
          <SecondaryTableRow
            key={data.id || i}
            data={data}
            keys={keys}
            onClick={(e) => props.onRowClick(e, data)}
          />)
        )}
      </tbody>
    </table>
  );
}

SecondaryTable.propTypes = {
  labels: PropTypes.array.isRequired,
  keys: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
  children: PropTypes.node,
  onRowClick: PropTypes.func,
};

SecondaryTable.defaultProps = {
  onRowClick: () => {},
};
