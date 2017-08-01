import React, { PropTypes } from 'react';


export default function Textarea(props) {
  return (
    <span className="Textarea">
      <textarea
        {...props}
        className={`form-control ${props.className}`}
      />
    </span>
  );
}

Textarea.propTypes = {
  className: PropTypes.string.isRequired,
};

Textarea.defaultProps = {
  className: '',
};
