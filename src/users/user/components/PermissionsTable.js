import React, { PropTypes } from 'react';

import { Table } from 'linode-components/tables';
import { CheckboxCell, LabelCell } from 'linode-components/tables/cells';


export default function PermissionsTable(props) {
  const { onCellChange, parentKey, columns, objects, title } = props;
  const headerColumn = {
    cellComponent: LabelCell,
    headerClassName: 'LabelColumn',
    dataKey: 'label',
    label: title,
    titleKey: 'label',
    tooltipEnabled: true,
  };

  const maybeCheckboxCell = (col) => !col ? {} : {
    cellComponent: col ? CheckboxCell : null,
    onChange: onCellChange,
    dataKey: col.dataKey,
    label: col.label,
  };

  const allColumns = [headerColumn, ...columns.map(col => ({
    parentKey,
    headerClassName: 'PermissionsCheckboxColumn',
    ...maybeCheckboxCell(col),
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
