import React from 'react';

import { Tabs } from 'linode-components/tabs';
import { default as Example } from './Example';

import { API_ROOT, API_VERSION } from '~/constants';


export default function MethodRequest(props) {
  const { examples } = props;

  const tabs = examples.map(function(example, index) {
    const exampleValue = example.value.replace(/https:\/\/\$api_root/g, API_ROOT).replace(/\$version/g, API_VERSION);
    return {
      name: example.name,
      children: (<Example key={`${example.name}-index`} example={exampleValue} />)
    };
  });

  return (
    <div className="Method-section Method-request">
      <h4><b>Request</b></h4>
      <Tabs tabs={tabs} />
    </div>
  );
};
