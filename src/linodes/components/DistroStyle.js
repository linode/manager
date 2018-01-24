import lowerCase from 'lodash/lowerCase';
import PropTypes from 'prop-types';
import React from 'react';

import { distros as distroAssets } from '~/assets';


export default function DistroStyle(props) {
  const { image } = props;

  if (!image || !image.vendor) {
    return <span className="distro-style">Unknown</span>;
  }

  const src = distroAssets[lowerCase(image.vendor)];

  return (
    <span className="distro-style">
      {src ? <img
        src={src}
        alt={image.vendor}
        width="15" height="15"
      /> : ''}
      <span>{image.label}</span>
    </span>
  );
}

DistroStyle.propTypes = {
  image: PropTypes.object,
};
