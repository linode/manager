import PropTypes from 'prop-types';
import React from 'react';

import { EmitEvent, FORM_SUBMIT } from '../utils';


export default function Form(props) {
  async function handleSubmit(event) {
    event.preventDefault();
    await props.onSubmit(event);

    const {
      title,
      type = 'form',
      action = 'edit',
    } = (props.analytics || {});

    if (props.analytics && !props.noSubmitEvent) {
      EmitEvent(FORM_SUBMIT, type, action, title);
    }
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
  noSubmitEvent: PropTypes.bool,
  children: PropTypes.node.isRequired,
  analytics: PropTypes.shape({
    type: PropTypes.string,
    action: PropTypes.string,
    title: PropTypes.string,
  }),
};

Form.defaultProps = {
  className: '',
  noSubmitEvent: false,
};
