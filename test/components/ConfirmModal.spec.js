import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';
import ConfirmModal from '../../src/components/ConfirmModal';

describe('components/ConfirmModal', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders customizable content', () => {
    const modal = mount(
      <ConfirmModal
        buttonText="OK button text"
        onOk={() => {}}
        onCancel={() => {}}
      >
        <span className="bodytext">a child element</span>
      </ConfirmModal>
    );

    expect(modal.find('.btn-default').text()).to.equal('OK button text');
    expect(modal.find('.bodytext').length).to.equal(1);
  });

  it('calls onOk when confirm button is pressed', () => {
    const onOk = sandbox.spy();

    const modal = mount(
      <ConfirmModal
        buttonText="OK button text"
        onOk={onOk}
        onCancel={() => {}}
      >
        Some text
      </ConfirmModal>
    );

    modal.find('.btn-default').simulate('click');
    expect(onOk.callCount).to.equal(1);
  });

  it('calls onCancel when cancel button is pressed', () => {
    const onCancel = sandbox.spy();

    const modal = mount(
      <ConfirmModal
        buttonText="OK button text"
        onOk={() => {}}
        onCancel={onCancel}
      >
        <span className="bodytext">a child element</span>
      </ConfirmModal>
    );

    modal.find('.btn-cancel').simulate('click');
    expect(onCancel.callCount).to.equal(1);
  });

  it('uses a default confirm button text', () => {
    const modal = mount(
      <ConfirmModal onOk={() => {}} onCancel={() => {}} />
    );

    expect(modal.find('.btn-default').text()).to.equal('Confirm');
  });
});
