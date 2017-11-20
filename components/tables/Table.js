import React from 'react';
import PropTypes from 'prop-types';

import TableHeaderRow from './TableHeaderRow';
import TableRow from './TableRow';


function renderRows(columns, data, onToggleSelect, selectedMap) {
  return data.map(function (record, index) {
    return (
      <TableRow
        // assumes that if one record in the collection does not have an id,
        // than no records should have an id, and all keys will fallback to
        // index usage
        key={record.id || index}
        index={index}
        columns={columns}
        record={record}
        onToggleSelect={onToggleSelect}
        selectedMap={selectedMap}
      />
    );
  });
}

export default function Table(props) {
  const {
    className,
    columns,
    data,
    disableHeader,
    id,
    noDataMessage,
    onToggleSelect,
    selectedMap,
    renderRowsFn = renderRows,
  } = props;

  let tableContent;
  if (!data.length) {
    tableContent = (<p>{noDataMessage}</p>);
  } else {
    tableContent = (
      <table id={id} className={`Table ${disableHeader ? 'Table--noHeader' : ''} ${className}`}>
        <thead>
          <TableHeaderRow columns={columns} disableHeader={disableHeader} />
        </thead>
        <tbody>
          {renderRowsFn(columns, data, onToggleSelect, selectedMap)}
        </tbody>
      </table>
    );
  }

  return tableContent;
}

Table.propTypes = {
  className: PropTypes.string,
  columns: PropTypes.arrayOf(PropTypes.shape({
    cellComponent: PropTypes.any,
    onChange: PropTypes.func,
    className: PropTypes.string,
    dataKey: PropTypes.string,
    formatFn: PropTypes.func,
  })),
  data: PropTypes.array.isRequired,
  disableHeader: PropTypes.bool,
  id: PropTypes.string,
  noDataMessage: PropTypes.string,
  onToggleSelect: PropTypes.func,
  selectedMap: PropTypes.object,
};

Table.defaultProps = {
  className: '',
  disableHeader: false,
  noDataMessage: 'No data found.',
};
