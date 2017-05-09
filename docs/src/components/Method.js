import React from 'react';

import { Table } from 'linode-components/tables';
import { Tabs } from 'linode-components/tabs';
import { default as Example } from './Example';
import { DescriptionCell, FieldCell } from './Tables/Cells';


export default function Method(props) {
  const { method } = props;
  const {
    name,
    description,
    examples,
    params = [],
    resource = {},
  } = method;

  const { schema = [] } = resource;

  // TODO: Break these out if needed
  let methodParams = null;
  if (params) {
    // { label: 'Type', dataKey: 'type' }
    methodParams = (
      <div className="Method-section Method-params">
        <h4><b>Params</b></h4>
        <Table
          className="Table--secondary"
          columns={[
            { label: 'Field', dataKey: 'name', headerClassName: 'FieldColumn' },
            { label: 'Description', dataKey: 'description', headerClassName: 'DescriptionColumn' }
          ]}
          data={params}
        />
      </div>
    );
  }

  let methodRequest = (
    <div className="Method-section Method-request">
      <h4><b>Request</b></h4>
      <Tabs
        tabs={examples.map(function(example, index) {
          // example: { name, value }
          return {
            name: example.name,
            children: (<Example key={index} example={example.value} />)
          };
        })}
      />
    </div>
  );

  let methodResponse = null;
  let methodResponseExample = null;
  if (name === 'GET') {
    methodResponse = (
      <div className="Method-section Method-response">
        <h4><b>Response</b></h4>
        <Table
          className="Table--secondary"
          columns={[
            { cellComponent: FieldCell, label: 'Field', headerClassName: 'FieldColumn' },
            { cellComponent: DescriptionCell, label: 'Description', headerClassName: 'DescriptionColumn' }
          ]}
          data={schema}
        />
      </div>
    );

    methodResponseExample = (
      <div className="Method-section Method-responseExample">
        <h4><b>Example</b></h4>
        <Example example={JSON.stringify(resource.example, null, 2)} />
      </div>
    );
  }

  return (
    <div id={name} className="Method">
      <h2>{name}</h2>
      <div className="Method-section">
        <p className="Method-description">{description}</p>
      </div>
      {methodParams}
      {methodRequest}
      {methodResponse}
      {methodResponseExample}
    </div>
  );
};
