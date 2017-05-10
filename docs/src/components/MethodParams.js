import React from 'react';

import { Table } from 'linode-components/tables';


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
          { label: 'Description', dataKey: 'description', headerClassName: 'DescriptionColumn' }
        ]}
        data={params}
      />
    </div>
  );
}
