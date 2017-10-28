import React from 'react';
import PropTypes from 'prop-types';


export default function ListGroup(props) {
  const { children, name } = props;

  return (
    <div className="ListGroup">
      {name ? <div className="ListGroup-label">{name}</div> : null}
      {children}
    </div>
  );
}

ListGroup.propTypes = {
  children: PropTypes.node,
  name: PropTypes.string,
};
