import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { ConfirmModalBody } from '~/components/modals';

describe('components/modal/ConfirmModal', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders customizable content', () => {
    const modal = mount(
      <ConfirmModalBody
        buttonText="OK button text"
        onOk={() => {}}
        onCancel={() => {}}
      >
        <span className="bodytext">a child element</span>
      </ConfirmModalBody>
    );

    expect(modal.find('.btn-default').text()).to.equal('OK button text');
    expect(modal.find('.bodytext').length).to.equal(1);
  });

  it('calls onOk when confirm button is pressed', () => {
    const onOk = sandbox.spy();

    const modal = mount(
      <ConfirmModalBody
        buttonText="OK button text"
        onOk={onOk}
        onCancel={() => {}}
      >
        Some text
      </ConfirmModalBody>
    );

    modal.find('.btn-default').simulate('click');
    expect(onOk.callCount).to.equal(1);
  });

  it('calls onCancel when cancel button is pressed', () => {
    const onCancel = sandbox.spy();

    const modal = mount(
      <ConfirmModalBody
        buttonText="OK button text"
        onOk={() => {}}
        onCancel={onCancel}
      >
        <span className="bodytext">a child element</span>
      </ConfirmModalBody>
    );

    modal.find('.btn-cancel').simulate('click');
    expect(onCancel.callCount).to.equal(1);
  });

  it('uses a default confirm button text', () => {
    const modal = mount(
      <ConfirmModalBody onOk={() => {}} onCancel={() => {}} />
    );

    expect(modal.find('.btn-default').text()).to.equal('Confirm');
  });
});
