import React, { PropTypes } from 'react';

export default function StyleguideSection(props) {
  return (
    <div className="StyleguideSection row" name={props.name}>
      <h2>{props.title}</h2>
      {props.children}
    </div>
  );
}

StyleguideSection.propTypes = {
  name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
