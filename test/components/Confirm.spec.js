import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';
import Confirm from '../../src/components/Confirm';

describe('components/Confirm', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders customizable content', () => {
    const modal = mount(
      <Confirm
        buttonText="OK button text"
        onOk={() => {}}
        onCancel={() => {}}
      >
        <span className="bodytext">a child element</span>
      </Confirm>
    );

    expect(modal.find('.btn-default').text()).to.equal('OK button text');
    expect(modal.find('.bodytext').length).to.equal(1);
  });

  it('calls onOk when confirm button is pressed', () => {
    const onOk = sandbox.spy();

    const modal = mount(
      <Confirm
        buttonText="OK button text"
        onOk={onOk}
        onCancel={() => {}}
      >
        Some text
      </Confirm>
    );

    modal.find('.btn-default').simulate('click');
    expect(onOk.callCount).to.equal(1);
  });

  it('calls onCancel when cancel button is pressed', () => {
    const onCancel = sandbox.spy();

    const modal = mount(
      <Confirm
        buttonText="OK button text"
        onOk={() => {}}
        onCancel={onCancel}
      >
        <span className="bodytext">a child element</span>
      </Confirm>
    );

    modal.find('.btn-cancel').simulate('click');
    expect(onCancel.callCount).to.equal(1);
  });

  it('uses a default confirm button text', () => {
    const modal = mount(
      <Confirm onOk={() => {}} onCancel={() => {}} />
    );

    expect(modal.find('.btn-default').text()).to.equal('Confirm');
  });
});
