import PropTypes from 'prop-types';
import React from 'react';

import { Table } from 'linode-components/tables';
import { RadioCell, LabelCell } from 'linode-components/tables/cells';


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


  const allColumns = [headerColumn, ...columns.map(col => ({
    parentKey,
    headerClassName: 'PermissionsCheckboxColumn',
    cellComponent: RadioCell,
    onChange: onCellChange,
    dataKey: col.dataKey,
    name: col.name,
    label: col.label,
    value: col.value,
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
