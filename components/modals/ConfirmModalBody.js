import React from 'react';

import FormModalBody from './FormModalBody';


export default function ConfirmModalBody(props) {
  return (
    <FormModalBody
      buttonText="Confirm"
      buttonDisabledText="Confirmed"
      {...props}
    />
  );
}
