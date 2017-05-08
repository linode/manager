import React, { PropTypes } from 'react';

import { Table } from 'linode-components/tables';
import { CheckboxCell } from 'linode-components/tables/cells';


export default function PermissionsTable(props) {
  const { onCellChange, parentKey, columns, objects, title } = props;
  const headerColumn = { dataKey: 'label', label: title };
  const allColumns = [headerColumn, ...columns.map(col => ({
    parentKey,
    headerClassName: 'PermissionsCheckboxColumn',
    ...(!col ? {} : {
      cellComponent: col ? CheckboxCell : null,
      onChange: onCellChange,
      dataKey: col.dataKey,
      label: col.label,
    }),
  }))];

  return (
    <div className="form-group Permissions-section">
      <h3>{title} permissions</h3>
      <Table
        className="Table--secondary"
        columns={allColumns}
        data={objects}
      />
    </div>
  );
}

PermissionsTable.propTypes = {
  title: PropTypes.string,
  parentKey: PropTypes.string,
  onCellChange: PropTypes.func,
  columns: PropTypes.array,
  objects: PropTypes.array,
};
