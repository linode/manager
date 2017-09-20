import React, { PropTypes } from 'react';

import { default as UseExample } from './UseExample';
import { default as SpecExample } from './SpecExample';
import { default as Spec } from './Spec';


export default function Method(props) {
  const { method } = props;
  const {
    name,
    description,
    money,
    oauth,
    examples,
    params,
    response,
  } = method;

  const methodRequest = !params.schema ? null : (
    <div className="Method-section">
      <h3>Request</h3>
      <Spec schema={params.schema} />
      <SpecExample example={params.example} type="Request" />
    </div>
  );

  const methodResponse = !response.schema ? null : (
    <div className="Method-section">
      <h3>Response</h3>
      <Spec schema={response.schema} />
      <SpecExample example={response.example} />
    </div>
  );

  return (
    <div id={name} className="Method">
      <div className="Title">
        <div className="Title-heading clearfix">
          <h2>{name}</h2>
          <div className="float-sm-right">
            <div>
              {money ? (
                <small className="text-muted">
                  <i className="fa fa-dollar"></i>
                  Will incur a charge on your account
                </small>) : null}
            </div>
            <div>
              {oauth ? <small className="text-muted">OAuth scopes: {oauth} </small> : null}
            </div>
          </div>
        </div>
        {!description ? null : <p>{description}</p>}
      </div>
      {methodRequest}
      {methodResponse}
      <div className="Method-section">
        <h3 className="Method-header">Basic Usage:</h3>
        <UseExample examples={examples} />
      </div>
    </div>
  );
}

Method.propTypes = {
  method: PropTypes.object,
};
