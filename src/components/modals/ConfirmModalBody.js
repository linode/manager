import React, { Component, PropTypes } from 'react';

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
          <button
            className="btn btn-cancel"
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

ConfirmModalBody.propTypes = {
  children: PropTypes.any,
  buttonText: PropTypes.string,
  onOk: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
