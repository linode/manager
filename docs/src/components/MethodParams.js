import React from 'react';

import { Table } from 'linode-components/tables';
import { DescriptionCell, ParamFieldCell } from './tables/Cells';


export default function MethodParams(props) {
  const { params } = props;
  return (
    <div className="Method-section Method-params">
      <h3><b>Parameters</b></h3>
      <Table
        className="Table--secondary"
        columns={[
          { cellComponent: ParamFieldCell, label: 'Field', headerClassName: 'FieldColumn' },
          { label: 'Type', dataKey: 'type', headerClassName: 'TypeColumn' },
          { cellComponent: DescriptionCell, label: 'Description', headerClassName: 'DescriptionColumn' }
        ]}
        data={params}
        noDataMessage="No parameters documented."
      />
    </div>
  );
}
