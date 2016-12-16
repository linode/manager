import React, { Component, PropTypes } from 'react';

export default class ConfirmModal extends Component {
  constructor() {
    super();
    this.handleOk = this.handleOk.bind(this);
    this.state = { loading: false };
  }

  async handleOk() {
    const { onOk } = this.props;
    this.setState({ loading: true });
    await onOk();
    this.setState({ loading: false });
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
          <button
            className="btn btn-default"
            disabled={loading}
            onClick={onCancel}
          >Cancel</button>
          <button
            className="btn btn-default"
            disabled={loading}
            onClick={this.handleOk}
          >{buttonText || 'Confirm'}</button>
        </div>
      </div>);
  }
}

ConfirmModal.propTypes = {
  children: PropTypes.any,
  buttonText: PropTypes.string,
  onOk: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
