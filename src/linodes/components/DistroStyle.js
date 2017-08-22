import React, { PropTypes } from 'react';

import { distros as distroAssets } from '~/assets';


export default function DistroStyle(props) {
  const { linode } = props;

  if (!linode || !linode.distribution || !linode.distribution.vendor) {
    return (<span>Unknown</span>);
  }

  const src = distroAssets[linode.distribution.vendor.toLowerCase()];

  return (
    <span className="distro-style">
      <img
        src={src}
        alt={linode.distribution.vendor}
        width="15" height="15"
      />
      <span>{linode.distribution.label}</span>
    </span>
  );
}

DistroStyle.propTypes = {
  linode: PropTypes.object,
};
