import React, { PropTypes } from 'react';

export default function SubmitButton(props) {
  return (
    <button
      type="submit"
      className={`btn ${props.className}`}
      disabled={props.disabled}
      onClick={props.onClick}
    >{props.children}</button>
  );
}

SubmitButton.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};

SubmitButton.defaultProps = {
  children: 'Save',
  className: 'btn-default',
  disabled: false,
};
