import React, { PropTypes } from 'react';

export default function SubmitButton(props) {
  return (
    <button
      type="submit"
      className="btn btn-default"
      disabled={props.disabled}
      onClick={props.onClick}
    >{props.text}</button>
  );
}

SubmitButton.propTypes = {
  text: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};

SubmitButton.defaultProps = {
  text: 'Save',
  disabled: false,
};
