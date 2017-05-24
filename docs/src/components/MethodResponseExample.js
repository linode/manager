import React from 'react';

import { default as Example } from './Example';


export default function MethodResponseExample(props) {
  const { resource } = props;

  return (
    <div className="Method-section MethodResponseExample">
      <h4><b>Example</b></h4>
      <Example example={JSON.stringify(resource.example, null, 2)} />
    </div>
  );
}
