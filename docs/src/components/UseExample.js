import React, { PropTypes } from 'react';

import { Tabs } from 'linode-components/tabs';
import { Code } from 'linode-components/formats';


export default function UseExample({ examples }) {
  if (!examples) {
    return null;
  }

  const tabs = examples.map(function ({ name, value }) {
    return {
      name,
      children: <Code key={`${name}-index`} example={value} name={name} />,
    };
  });

  return (
    <div className="UseExample">
      <Tabs tabs={tabs} />
    </div>
  );
}

UseExample.propTypes = {
  examples: PropTypes.arrayOf(PropTypes.object),
};
