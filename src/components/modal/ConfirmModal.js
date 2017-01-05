import React, { PropTypes } from 'react';

import { CancelButton } from '~/components/form';

export default function ConfirmModal(props) {
  return (
    <div>
      <p>
        {props.children}
      </p>
      <div className="modal-footer">
        <CancelButton onClick={props.onCancel} />
        <button
          className="btn btn-default"
          onClick={props.onOk}
        >{props.buttonText || 'Confirm'}</button>
      </div>
    </div>
  );
}

ConfirmModal.propTypes = {
  children: PropTypes.any,
  buttonText: PropTypes.string,
  onOk: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
