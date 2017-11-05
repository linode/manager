import PropTypes from 'prop-types';
import React from 'react';


export default function Card(props) {
  return (
    <div className={`Card ${props.className}`} id={props.id}>
      {props.header}
      <div className="Card-body">
        {props.children}
      </div>
    </div>
  );
}

Card.propTypes = {
  className: PropTypes.string,
  id: PropTypes.string,
  children: PropTypes.node,
  header: PropTypes.node,
};

Card.defaultProps = {
  className: '',
};
