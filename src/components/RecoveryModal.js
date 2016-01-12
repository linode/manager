import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody } from './Modal';

export class RecoveryModal extends Component {
  render() {
    const { visible } = this.props;
    return (
      <Modal visible={visible} large={true}>
        <ModalHeader>Linode Recovery</ModalHeader>
        <ModalBody>
          <p>TODO</p>
        </ModalBody>
      </Modal>
    );
  }
}
