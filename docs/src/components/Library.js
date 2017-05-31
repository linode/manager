import React from 'react';
import { Link } from 'react-router';

import { Breadcrumbs } from 'linode-components/breadcrumbs';
import { Table } from 'linode-components/tables';
import { LinkCell } from 'linode-components/tables/cells';

import { default as Method } from './Method';


export default function Library(props) {
  const { route } = props;
  const { crumbs, libraryObject } = route;
  const { name, desc, formattedLibraryObject } = libraryObject;
  const methods = Object.keys(formattedLibraryObject.methods).map(function(key, index) {
    let method = formattedLibraryObject.methods[key];
    let parameters = Object.keys(method.parameters).map(function(key, index) {
      return { name: key, ...method.parameters[key] };
    });
    return {name: key,
      ...method,
      parameters,
    };
  });
  const constructorParameters = Object.keys(formattedLibraryObject.constructor.parameters).map(function(key, index) {
    return { name: key, desc: formattedLibraryObject.constructor.parameters[key].desc };
  });

  console.log('libraryObject', libraryObject);
  console.log('methods', methods);

  return (
    <div className="Endpoint">
      <div className="Endpoint-header">
        <div className="Endpoint-breadcrumbsContainer">
          <Breadcrumbs crumbs={crumbs} />
        </div>
        <div className="Endpoint-title">
          <h1>{formattedLibraryObject.name}</h1>
          <p>{formattedLibraryObject.desc}</p>
        </div>
        <div className="divider"></div>
        <pre>
          <code>
            {formattedLibraryObject.import}
          </code>
        </pre>
        <h2>Constructor</h2>
        <pre>
          <code>
            {formattedLibraryObject.constructor.example}
          </code>
        </pre>
        <div className="Endpoint-body">
          <div>
            <div id="parameters" className="Method">
              <div className="Method-section Method-params">
                <Table
                  className="Table--secondary"
                  columns={[
                    { label: 'Property', dataKey: 'name', headerClassName: 'FieldColumn' },
                    { label: 'Description', dataKey: 'desc', headerClassName: 'DescriptionColumn' }
                  ]}
                  data={constructorParameters}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="divider"></div>
        <div className="Endpoint-body">
          {methods.map(function(method, index) {
            return (
              <div>
                <div id={method.name} className="Method">
                  <h2>{method.name}</h2>
                  <div className="Method-section">
                    <p className="Method-description">{method.desc}</p>
                  </div>
                  <div className="Method-section Method-params">
                    <h4><b>Parameters</b></h4>
                    <Table
                      className="Table--secondary"
                      columns={[
                        { label: 'Argument', dataKey: 'name', headerClassName: 'FieldColumn' },
                        { label: 'Description', dataKey: 'desc', headerClassName: 'DescriptionColumn' }
                      ]}
                      data={method.parameters}
                    />
                  </div>
                </div>
                {index < (methods.length - 1) ? <div className="divider"></div> : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
