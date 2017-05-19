import React from 'react';

import { Tabs } from 'linode-components/tabs';
import { default as Example } from './Example';


export default function MethodRequest(props) {
  const { examples } = props;

  return (
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
};
