import React, { Component, PropTypes } from 'react';

import { SubmitButton, CancelButton } from '~/components/form';

export default class ConfirmModalBody extends Component {
  constructor() {
    super();
    this.state = { loading: false };
  }

  handleOk = async () => {
    const { onOk } = this.props;
    this.setState({ loading: true });
    await onOk();
  }

  render() {
    const { buttonText, onCancel } = this.props;
    const { loading } = this.state;
    return (
      <div>
        <p>
          {this.props.children}
        </p>
        <div className="modal-footer">
          <CancelButton disabled={loading} onClick={onCancel} />
          <SubmitButton
            disabled={loading}
            onClick={this.handleOk}
          >{buttonText || 'Confirm'}</SubmitButton>
        </div>
      </div>);
  }
}

ConfirmModalBody.propTypes = {
  children: PropTypes.any,
  buttonText: PropTypes.string,
  onOk: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
