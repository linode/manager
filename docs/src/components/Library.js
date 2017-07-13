import React, { PropTypes } from 'react';

import { Breadcrumbs } from 'linode-components/breadcrumbs';
import { Table } from 'linode-components/tables';

import { default as Example } from './Example';


export default function Library(props) {
  const { route } = props;
  const { crumbs, libraryObject } = route;
  const { formattedLibraryObject, language } = libraryObject;

  function methodContents(containingObject, key) {
    const method = containingObject.methods[key];

    if (method.parameters) {
      const parameters = Object.keys(method.parameters).map(function (key) {
        return { name: key, ...method.parameters[key] };
      });

      return {
        name: key,
        ...method,
        parameters,
      };
    }

    return {
      name: key,
      ...method,
    };
  }

  let methods = [];
  if (formattedLibraryObject.methods) {
    methods = Object.keys(formattedLibraryObject.methods).map(function (key) {
      return methodContents(formattedLibraryObject, key);
    });
  }

  const constructorParameters = Object.keys(formattedLibraryObject.constructor.parameters)
    .map(function (key) {
      return {
        name: key,
        desc: formattedLibraryObject.constructor.parameters[key].desc,
      };
    });

  function methodDisplay(method, index) {
    return (
      <div>
        <div id={method.name} className="Method">
          <h2>{method.name}</h2>
          <div className="Method-section">
            <p className="Method-description">{method.desc}</p>
          </div>
          <Example example={method.example} />
          <div className="Method-section Method-params">
            <h4><b>Parameters</b></h4>
            <Table
              className="Table--secondary"
              columns={[
                { label: 'Argument', dataKey: 'name', headerClassName: 'FieldColumn' },
                { label: 'Description', dataKey: 'desc', headerClassName: 'DescriptionColumn' },
              ]}
              data={!!method.parameters ? Object.values(method.parameters) : []}
            />
            <strong>Returns:</strong> {method.returns}
          </div>
        </div>
        {index < (methods.length - 1) ? <div className="divider"></div> : null}
      </div>
    );
  }

  function groupDisplay(group) {
    const methods = Object.keys(group.methods).map(function (key) {
      return methodContents(group, key);
    });

    return (
      <div className="Endpoint-title">
        <h2>{group.name} Group</h2>
        <p>{group.desc}</p>
        <div className="Endpoint-body">
          {Object.keys(methods).map(function (key, i) {
            return methodDisplay(methods[key], i);
          })}
        </div>
      </div>
    );
  }

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
        <Example example={formattedLibraryObject.import} language={language} />
        <h2>Constructor</h2>
        <Example example={formattedLibraryObject.constructor.example} language={language} />
        <div className="Endpoint-body">
          <div>
            <div id="parameters" className="Method">
              <div className="Method-section Method-params">
                <Table
                  className="Table--secondary"
                  columns={[
                    { label: 'Property', dataKey: 'name', headerClassName: 'FieldColumn' },
                    { label: 'Description', dataKey: 'desc', headerClassName: 'DescriptionColumn' },
                  ]}
                  data={constructorParameters}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="divider"></div>
        <div className="Endpoint-body">
          {methods.map(function (method, index) {
            return methodDisplay(method, index);
          })}
        </div>
        <div className="divider"></div>
        {!!formattedLibraryObject.groups ? Object.keys(formattedLibraryObject.groups)
            .map(function (key) {
              return groupDisplay(formattedLibraryObject.groups[key]);
            }) : null}
      </div>
    </div>
  );
}

Library.propTypes = {
  route: PropTypes.object,
};
