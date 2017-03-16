import React, { PropTypes } from 'react';

import { distros as distroAssets } from '~/assets';


export default function DistroStyle(props) {
  const { linode } = props;

  if (!linode || !linode.distribution || !linode.distribution.vendor) {
    return (<span>Unknown</span>);
  }

  return (
    <span className="distro-style">
      <img
        src={distroAssets[linode.distribution.vendor]
          ? distroAssets[linode.distribution.vendor] : '//placehold.it/50x50'}
        alt={linode.distribution.vendor}
        width="15" height="15"
      />
      <span>{linode.distribution.vendor}</span>
    </span>
  );
}

DistroStyle.propTypes = {
  linode: PropTypes.object,
};
