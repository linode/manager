import React, { PropTypes } from 'react';

export default function Checkboxes(props) {
  return <div className="Checkboxes">{props.children}</div>;
}

Checkboxes.propTypes = {
  children: PropTypes.object.isRequired,
};
