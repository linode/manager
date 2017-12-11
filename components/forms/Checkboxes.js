import PropTypes from 'prop-types';
import React from 'react';

export default function Checkboxes(props) {
  return <fieldset className="Checkboxes">{props.children}</fieldset>;
}

Checkboxes.propTypes = {
  children: PropTypes.any.isRequired,
};
