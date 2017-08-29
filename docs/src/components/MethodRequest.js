import React, { PropTypes } from 'react';

import { Tabs } from 'linode-components/tabs';
import { Code } from 'linode-components/formats';

export default function MethodRequest(props) {
  const { examples } = props;

  const tabs = examples.map(function (example) {
    return {
      name: example.name,
      children: (
        <Code key={`${example.name}-index`} example={example.value} name={example.name} />
      ),
    };
  });

  return (
    <div className="Method-section Method-request">
      <h3>Request</h3>
      <Tabs tabs={tabs} />
    </div>
  );
}

MethodRequest.propTypes = {
  examples: PropTypes.arrayOf(PropTypes.object),
};
