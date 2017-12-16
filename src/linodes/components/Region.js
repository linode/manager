import PropTypes from 'prop-types';
import React from 'react';
import flags from '~/assets/flags';

export default function Region(props) {
  const { obj } = props;

  return (
    <span className="region-style">
      <img
        src={flags[obj.region]}
        height="15"
        width="20"
        role="presentation"
      />
      <span>{obj.region}</span>
    </span>
  );
}

Region.propTypes = {
  obj: PropTypes.object,
};
