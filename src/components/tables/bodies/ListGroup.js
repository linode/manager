import React, { PropTypes } from 'react';


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
