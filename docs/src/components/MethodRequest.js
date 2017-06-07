import React from 'react';

import { Tabs } from 'linode-components/tabs';
import { default as Example } from './Example';

export default function MethodRequest(props) {
  const { examples } = props;

  const tabs = examples.map(function(example, index) {
    return {
      name: example.name,
      children: (<Example key={`${example.name}-index`} example={example.value} name={example.name} />)
    };
  });

  return (
    <div className="Method-section Method-request">
      <h3><b>Request</b></h3>
      <Tabs tabs={tabs} />
    </div>
  );
};
