import React from 'react';

import { Input } from 'linode-components/forms';


export default function DomainInput(props) {
  return (
    <Input
      {...props}
      label={`.${props.base}`}
    />
  );
}

DomainInput.stripBase = function (subdomain = '', base) {
  if (subdomain.endsWith(base)) {
    return subdomain.slice(0, -1 * (base.length + 1));
  }

  return subdomain;
};

DomainInput.propTypes = {
  ...Input.propTypes,
  base: Input.propTypes,
};
