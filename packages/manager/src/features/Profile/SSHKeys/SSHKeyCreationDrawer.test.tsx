import { shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';
import { SSHKeyCreationDrawer } from './SSHKeyCreationDrawer';

jest.mock('linode-js-sdk/lib/profile');

const o = {
  labelField: `WithStyles(LinodeTextField)[data-qa-label-field=true]`,
  keyField: `WithStyles(LinodeTextField)[data-qa-ssh-key-field]`,
  submitButton: `WithStyles(wrappedButton)[data-qa-submit]`,
  cancelButton: `WithStyles(wrappedButton)[data-qa-cancel]`
};

describe('SSHKeyCreationDrawer', () => {
  let wrapper: ShallowWrapper;
  const onSuccess = jest.fn();
  const onCancel = jest.fn();

  beforeEach(() => {
    onSuccess.mockReset();
    onCancel.mockReset();

    wrapper = shallow(
      <SSHKeyCreationDrawer
        open={true}
        onCancel={onCancel}
        onSuccess={onSuccess}
      />
    );
  });

  it('should have an input field for label', () => {
    const labelField = wrapper.find(o.labelField);
    expect(labelField.exists()).toBeTruthy();
  });

  it('should have an input field for public key', () => {
    const keyField = wrapper.find(o.keyField);
    expect(keyField.exists()).toBeTruthy();
  });

  it('should have a button to save', () => {
    const submitButton = wrapper.find(o.submitButton);
    expect(submitButton.exists()).toBeTruthy();
  });

  it('should have a button to cancel', () => {
    const cancelButton = wrapper.find(o.cancelButton);
    expect(cancelButton.exists()).toBeTruthy();
  });
});
