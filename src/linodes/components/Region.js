import React, { PropTypes } from 'react';

import { flags } from '~/assets';


export default function Region(props) {
  const { obj } = props;

  return (
    <span className="region-style">
      <img
        src={flags[obj.region.country]
          ? flags[obj.region.country] : '//placehold.it/50x50'}
        height="15" width="20" alt={obj.region.label}
      />
      <span>{obj.region.label}</span>
    </span>
  );
}

Region.propTypes = {
  obj: PropTypes.object,
};
