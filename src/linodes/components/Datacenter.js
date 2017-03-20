import React, { PropTypes } from 'react';

import { flags } from '~/assets';


export default function Datacenter(props) {
  const { obj } = props;

  return (
    <span className="datacenter-style">
      <img
        src={flags[obj.datacenter.country]
          ? flags[obj.datacenter.country] : '//placehold.it/50x50'}
        height="15" width="20" alt={obj.datacenter.label}
      />
      <span>{obj.datacenter.label}</span>
    </span>
  );
}

Datacenter.propTypes = {
  obj: PropTypes.object,
};
