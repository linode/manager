import React, { Component } from 'react';

export class Modal extends Component {
  render() {
    const { visible, large } = this.props;
    return (
      <div className={`modal fade ${large ? "modal-large" : ""} ${visible ? "in" : ""}`}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

export class ModalHeader extends Component {
  render() {
    return (
      <div className="modal-header">
        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        <h4 className="modal-title">{this.props.children}</h4>
      </div>
    );
  }
}

export class ModalBody extends Component {
  render() {
    return (
      <div className="modal-body">
        {this.props.children}
      </div>
    );
  }
}
