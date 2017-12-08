import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import { distros as distroAssets } from '~/assets';


export default function DistroStyle(props) {
  const { linode } = props;

  if (!linode || !linode.image || !linode.image.vendor) {
    return <span className="distro-style">Unknown</span>;
  }

  const src = distroAssets[_.lowerCase(linode.image.vendor)];

  return (
    <span className="distro-style">
      {src ? <img
        src={src}
        alt={linode.image.vendor}
        width="15" height="15"
      /> : ''}
      <span>{linode.image.vendor}</span>
    </span>
  );
}

DistroStyle.propTypes = {
  linode: PropTypes.object,
};
