import React from 'react';

import { default as Example } from './Example';


export default function Method(props) {
  const { method } = props;
  const { name, description, examples, params } = method;

  return (
    <div className="Method">
      <h2>{name}</h2>
      <p className="Method-description">{description}</p>
      <div className="Method-request">
        <h4><b>Request</b></h4>
        {examples.map(function(example, index) {
          return (<Example key={index} example={example} />);
        })}
      </div>
      <div className="Method-response">
        <h4><b>Response</b></h4>
      </div>
    </div>
  );
};
