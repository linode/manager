import React, { PropTypes } from 'react';

export default function SubmitButton(props) {
  return (
    <button
      type="submit"
      className="btn btn-default"
      disabled={props.disabled}
      onClick={props.onClick}
    >{props.children}</button>
  );
}

SubmitButton.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};

SubmitButton.defaultProps = {
  children: 'Save',
  disabled: false,
};
