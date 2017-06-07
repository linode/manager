import React from 'react';

import { Tabs } from 'linode-components/tabs';
import { default as Example } from './Example';

export default function MethodRequest(props) {
  const { examples } = props;

  const tabs = examples.map(function(example, index) {
    return {
      name: example.name,
      children: (<Example key={`${example.name}-index`} example={example.value} />)
    };
  });

  return (
    <div className="Method-section Method-request">
      <h4><b>Request</b></h4>
      <Tabs tabs={tabs} />
    </div>
  );
};
