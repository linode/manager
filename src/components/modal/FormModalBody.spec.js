import { shallow, mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { FormModalBody } from 'linode-components/modals';
import SubmitButton from 'linode-components/forms/SubmitButton';

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
    // Has a submit button/
    expect(modal.find(SubmitButton).length).toBe(1);
    expect(modal.find('.bodytext').length).toBe(1);
  });

  it('calls onSubmit when confirm button is pressed', () => {
    const onSubmit = sandbox.spy();

    const modal = shallow(
      <FormModalBody
        buttonText="OK button text"
        onSubmit={onSubmit}
        onCancel={() => {}}
      >
        Some text
      </FormModalBody>
    );

    modal.find('Form').props().onSubmit({ preventDefault() {} });
    expect(onSubmit.callCount).toBe(1);
  });

  it('calls onCancel when cancel button is pressed', () => {
    const onCancel = sandbox.spy();

    const modal = shallow(
      <FormModalBody
        buttonText="OK button text"
        onSubmit={() => {}}
        onCancel={onCancel}
      >
        <span className="bodytext">a child element</span>
      </FormModalBody>
    );

    modal.find('CancelButton').simulate('click');
    expect(onCancel.callCount).toBe(1);
  });
});
