import React from 'react';

import { Table } from 'linode-components/tables';
import { default as Example } from './Example';


export default function Method(props) {
  const { method } = props;
  const {
    name,
    description,
    examples,
    params,
    resource = {},
  } = method;
  const { enums = [], schema = [] } = resource;

  // TODO: Break these out if needed

  let methodParams = null;
  if (params) {
    // { label: 'Type', dataKey: 'type' }
    methodParams = (
      <div className="Method-params">
        <h4><b>Params</b></h4>
        <Table
          className="Table--secondary"
          columns={[
            { label: 'Field', dataKey: 'name' },
            { label: 'Description', dataKey: 'description' },
            {}
          ]}
          data={params}
        />
      </div>
    );
  }

  let methodRequest = (
    <div className="Method-request">
      <h4><b>Request</b></h4>
      {examples.map(function(example, index) {
        return (<Example key={index} example={example} />);
      })}
    </div>
  );

  let methodResponse = null;
  if (name === 'GET') {
    methodResponse = (
      <div className="Method-response">
        <h4><b>Response</b></h4>
        <Table
          className="Table--secondary"
          columns={[
            { label: 'Field', dataKey: 'name' },
            { label: 'Type', dataKey: 'type' },
            { label: 'Description', dataKey: 'description' },
            {}
          ]}
          data={schema}
        />
      </div>
    );
  }

  return (
    <div className="Method">
      <h2>{name}</h2>
      <p className="Method-description">{description}</p>
      {methodParams}
      {methodRequest}
      {methodResponse}
    </div>
  );
};
