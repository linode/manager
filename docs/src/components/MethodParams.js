import React from 'react';

import { Table } from 'linode-components/tables';
import { DescriptionCell, ParamFieldCell } from './tables/Cells';


export default function MethodParams(props) {
  const { params } = props;
  return (
    <div className="Method-section Method-params">
      <h4><b>Parameters</b></h4>
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
