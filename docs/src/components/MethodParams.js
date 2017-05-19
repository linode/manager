import React from 'react';

import { Table } from 'linode-components/tables';
import { DescriptionCell } from './tables/Cells';


export default function MethodParams(props) {
  const { params } = props;
  return (
    <div className="Method-section Method-params">
      <h4><b>Parameters</b></h4>
      <Table
        className="Table--secondary"
        columns={[
          { label: 'Field', dataKey: 'name', headerClassName: 'FieldColumn' },
          { label: 'Type', dataKey: 'type', headerClassName: 'TypeColumn' },
          { label: 'Description', cellComponent: DescriptionCell, headerClassName: 'DescriptionColumn' }
        ]}
        data={params}
      />
    </div>
  );
}
