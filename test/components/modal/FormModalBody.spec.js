import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { FormModalBody } from 'linode-components/modals';


describe('components/modal/FormModalBody', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders customizable content', () => {
    const modal = mount(
      <FormModalBody
        buttonText="OK button text"
        onSubmit={() => {}}
        onCancel={() => {}}
      >
        <span className="bodytext">a child element</span>
      </FormModalBody>
    );

    expect(modal.find('.btn-default').at(1).text()).to.equal('OK button text');
    expect(modal.find('.bodytext').length).to.equal(1);
  });

  it('calls onSubmit when confirm button is pressed', () => {
    const onSubmit = sandbox.spy();

    const modal = mount(
      <FormModalBody
        buttonText="OK button text"
        onSubmit={onSubmit}
        onCancel={() => {}}
      >
        Some text
      </FormModalBody>
    );

    modal.find('Form').props().onSubmit({ preventDefault() {} });
    expect(onSubmit.callCount).to.equal(1);
  });

  it('calls onCancel when cancel button is pressed', () => {
    const onCancel = sandbox.spy();

    const modal = mount(
      <FormModalBody
        buttonText="OK button text"
        onSubmit={() => {}}
        onCancel={onCancel}
      >
        <span className="bodytext">a child element</span>
      </FormModalBody>
    );

    modal.find('CancelButton').simulate('click');
    expect(onCancel.callCount).to.equal(1);
  });
});
