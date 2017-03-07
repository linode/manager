import React, { Component, PropTypes } from 'react';

import TableHeaderRow from './TableHeaderRow';
import TableRow from './TableRow';


export default class Table extends Component {

  render() {
    const {
      className,
      columns,
      data,
      disableHeader,
      id,
      onToggleSelect,
      selected = {},
    } = this.props;

    let tableHeader;
    if (!disableHeader) {
      tableHeader = (
        <thead>
          <TableHeaderRow columns={columns} />
        </thead>
      );
    } else {
      tableHeader = (<thead></thead>);
    }

    return (
      <table id={id} className={`Table ${className}`}>
        {tableHeader}
        <tbody>
          {data.map(function (record, index) {
            return (
              <TableRow
                // assumes that if one record in the collection does not have an id, than no records should have an
                // id, and all keys will fallback to index usage
                key={record.id || index}
                columns={columns}
                record={record}
                onToggleSelect={onToggleSelect}
                selected={selected[record.id] ? true : false}
              />
            );
          })}
        </tbody>
      </table>
    );
  }
}

Table.propTypes = {
  className: PropTypes.string,
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  disableHeader: PropTypes.bool,
  id: PropTypes.string,
  onToggleSelect: PropTypes.func,
  selected: PropTypes.object,
};

Table.defaultProps = {
  className: '',
  disableHeader: false,
};
