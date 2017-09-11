import React, { PropTypes } from 'react';

import { default as MethodParams } from './MethodParams';
import { default as MethodRequest } from './MethodRequest';
import { default as MethodResponse } from './MethodResponse';
import { default as MethodResponseExample } from './MethodResponseExample';


export default function Method(props) {
  const { method } = props;
  const {
    name,
    description,
    examples,
    money,
    oauth,
    params,
    response,
  } = method;

  // TODO: Break these out if needed
  const methodParams = <MethodParams params={params} />;

  let methodRequest = (
    <MethodRequest examples={examples} />
  );

  let methodResponse = null;
  let methodResponseExample = null;

  const responseSchema = response.schema;
  if (responseSchema) {
    methodResponse = (<MethodResponse schema={responseSchema} />);

    if (response.example) {
      methodResponseExample = (<MethodResponseExample response={response} />);
    }
  }

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
      {methodParams}
      {methodRequest}
      {methodResponse}
      {methodResponseExample}
    </div>
  );
}

Method.propTypes = {
  method: PropTypes.object,
};
