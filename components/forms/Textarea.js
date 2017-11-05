import PropTypes from 'prop-types';
import React from 'react';


export default function Textarea(props) {
  return (
    <span className="Textarea">
      <textarea
        {...props}
        id={props.id || props.name}
        className={`form-control ${props.className}`}
      />
    </span>
  );
}

Textarea.propTypes = {
  className: PropTypes.string.isRequired,
  id: PropTypes.string,
  name: PropTypes.string,
};

Textarea.defaultProps = {
  className: '',
};
