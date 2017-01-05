import React, { PropTypes } from 'react';

export default function Form(props) {
  function handleSubmit(event) {
    event.preventDefault();
    props.onSubmit(event);
  }

  return (
    <form
      className={props.className}
      onSubmit={handleSubmit}
    >{props.children}</form>
  );
}

Form.propTypes = {
  className: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};
