import React, { PropTypes } from 'react';

export default function Section(props) {
  return (
    <div className="Styleguide-section row" name={props.name}>
      <h2>{props.title}</h2>
      {props.children}
    </div>
  );
}

Section.propTypes = {
  name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
